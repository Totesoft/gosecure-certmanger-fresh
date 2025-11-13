import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock, Download } from "lucide-react";

const API_BASE_URL = "https://pre-prod.be.anchorvpn.net/api/v1";
// Interfaces for the certificate hierarchy
export interface LeafCertificate {
    id: string;
    common_name: string;
    valid_until: string;
}

export interface IntermediateCertificate {
    id: string;
    common_name: string;
    valid_until: string;
    status: string;
    issued_certificates?: LeafCertificate[];
}

export interface RootCertificate {
    id: string;
    common_name: string;
    valid_until: string;
    status: string;
    intermediates?: IntermediateCertificate[];
}

// Optional interface if your backend includes server mappings
export interface Server {
    id: string;
    name: string;
    ip_address?: string;
    status?: string;
    cert_id?: string;
}

export default function UserDashboard() {
    const [orgId, setOrgId] = useState(localStorage.getItem("orgId") || "");
    const [certs, setCerts] = useState([]);
    const [intermediates, setIntermediates] = useState({});
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [expandedIntermediates, setExpandedIntermediates] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [loadingIntermediates, setLoadingIntermediates] = useState({});
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("certs");
    const [certIdToDownload, setCertIdToDownload] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [downloadMessage, setDownloadMessage] = useState("");
    const [certTypeToDownload, setCertTypeToDownload] = useState("");


    // --- FETCH ROOT CAs ---
    const fetchCerts = async () => {
        if (!orgId?.trim()) {
            setCerts([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE_URL}/organizations/${orgId}/root-ca/`);
            setCerts(res.data || []);
        } catch (err) {
            console.error("fetchCerts error", err);
            setError("Failed to fetch certificates. Check Org ID.");
            setCerts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "certs" || activeTab === "alerts") fetchCerts();
        else if (activeTab === "server") fetchServers();
    }, [activeTab, orgId]);

    const handleOrgIdChange = (e) => {
        const value = e.target.value;
        setOrgId(value);
        localStorage.setItem("orgId", value);
    };

    const daysRemaining = (validUntil: string | number | Date) => {
        const diff = new Date(validUntil).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    // --- FETCH INTERMEDIATES + ISSUED CERTS ---
    const fetchIntermediates = async (rootCaId: any) => {
        setLoadingIntermediates((p) => ({ ...p, [rootCaId]: true }));
        try {
            const res = await axios.get(`${API_BASE_URL}/root-ca/${rootCaId}/intermediate-ca/`);
            const ints = res.data || [];
            const issuedPromises = ints.map(async (int: { id: any; }) => {
                try {
                    const r = await axios.get(`${API_BASE_URL}/intermediate-ca/${int.id}/certificates/`);
                    return { ...int, issued_certificates: r.data || [] };
                } catch {
                    return { ...int, issued_certificates: [] };
                }
            });
            const intsWithIssued = await Promise.all(issuedPromises);
            setIntermediates((prev) => ({ ...prev, [rootCaId]: intsWithIssued }));
        } catch (err) {
            console.error("fetchIntermediates error", err);
        } finally {
            setLoadingIntermediates((p) => ({ ...p, [rootCaId]: false }));
        }
    };

    const toggleRow = (rootCaId: unknown) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            const isExpanding = !next.has(rootCaId);
            if (isExpanding) {
                next.add(rootCaId);
                if (!intermediates[rootCaId]) fetchIntermediates(rootCaId);
            } else next.delete(rootCaId);
            return next;
        });
    };

    const toggleIntermediate = (intermediateId: unknown) => {
        setExpandedIntermediates((prev) => {
            const next = new Set(prev);
            next.has(intermediateId) ? next.delete(intermediateId) : next.add(intermediateId);
            return next;
        });
    };

    const getStatusStyles = (isActive, remainingDays) => {
        if (!isActive)
            return { text: "Inactive", icon: <Clock size={16} />, className: "bg-gray-200 text-gray-600" };
        if (remainingDays <= 10)
            return { text: "Expiring Soon", icon: <AlertTriangle size={16} />, className: "bg-red-100 text-red-700" };
        if (remainingDays <= 30)
            return { text: "Warning", icon: <AlertTriangle size={16} />, className: "bg-yellow-100 text-yellow-700" };
        return { text: "Active", icon: <CheckCircle size={16} />, className: "bg-green-100 text-green-700" };
    };

    // --- DOWNLOAD ---
    const handleDownload = async () => {
        if (!certIdToDownload.trim()) {
            setDownloadMessage("Please enter a certificate ID.");
            return;
        }
        setDownloading(true);
        setDownloadMessage("");
        try {
            const url = `${API_BASE_URL}/certificates/${certIdToDownload}/download/`;
            const res = await axios.get(url, { responseType: "blob" });
            const blob = new Blob([res.data], { type: "application/x-x509-ca-cert" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${certIdToDownload}.crt`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setDownloadMessage("Certificate downloaded successfully.");
        } catch (err) {
            console.error("Download failed", err);
            setDownloadMessage("Failed to download certificate. Check the ID.");
        } finally {
            setDownloading(false);
        }
    };

    // --- ALERTS TAB ---
    const renderAlerts = () => {
        const soonExpiring = certs.filter((c) => daysRemaining(c.valid_until) <= 30);
        return (
            <div className="p-8">
                <h2 className="text-3xl font-bold mb-4">Expiring Certificates</h2>
                {soonExpiring.length === 0 ? (
                    <p className="text-lg text-gray-500 italic">No upcoming expirations.</p>
                ) : (
                    soonExpiring.map((c) => (
                        <div key={c.id} className="border-b border-gray-300 py-3">
                            <p className="text-xl font-semibold">{c.common_name}</p>
                            <p className="text-red-600">Expires on: {new Date(c.valid_until).toLocaleDateString()}</p>
                        </div>
                    ))
                )}
            </div>
        );
    };

    // --- DOWNLOAD TAB ---
    const renderDownloadTab = () => (
        <div className="p-8 max-w-lg mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Download Certificate</h2>

            {/* Certificate Type Dropdown */}
            <label className="block text-lg font-medium mb-2 text-gray-700">
                Select Certificate Type
            </label>
            <select
                value={certTypeToDownload}
                onChange={(e) => setCertTypeToDownload(e.target.value)}
                className="border border-gray-400 rounded-lg p-3 w-full mb-5 text-lg bg-white"
            >
                <option value="">-- Select Certificate Type --</option>
                <option value="root">Root CA</option>
                <option value="intermediate">Intermediate</option>
                <option value="issued">Issued Certificate</option>
            </select>

            {/* Certificate ID Input */}
            <label className="block text-lg font-medium mb-2 text-gray-700">
                Certificate ID
            </label>
            <input
                type="text"
                placeholder="Enter Certificate ID"
                value={certIdToDownload}
                onChange={(e) => setCertIdToDownload(e.target.value)} // keeps this independent of certType
                className="border border-gray-400 rounded-lg p-3 w-full mb-5 text-lg"
            />

            {/* Download Button */}
            <button
                onClick={handleDownload}
                disabled={downloading}
                className={`px-6 py-3 w-full text-white text-lg font-medium rounded-lg transition ${downloading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                {downloading ? "Downloading..." : "Download"}
            </button>

            {/* Download Message */}
            {downloadMessage && (
                <p className="mt-5 text-lg font-semibold text-center text-gray-700">
                    {downloadMessage}
                </p>
            )}
        </div>
    );

    // --- SERVER TAB ---
    const [servers, setServers] = useState([]);
    const fetchServers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/certificates/server/`);
            setServers(res.data || []);
        } catch {
            setServers([]);
        }
    };
    const renderServers = () => (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-4">Server Details</h2>
            {servers.length === 0 ? (
                <p className="text-gray-500 italic">No server details available.</p>
            ) : (
                servers.map((s) => (
                    <div key={s.id} className="border-b border-gray-300 py-3">
                        <p className="text-xl font-semibold">{s.name}</p>
                        <p>{s.ip_address}</p>
                    </div>
                ))
            )}
        </div>
    );

    // --- CERTIFICATES TAB ---
    const renderCertCards = () => {
        if (loading)
            return <p className="text-center text-lg font-medium">Loading certificates...</p>;
        if (error)
            return <p className="text-center text-red-500 font-medium">{error}</p>;
        if (!certs || certs.length === 0)
            return (
                <p className="text-center text-lg italic text-gray-500">
                    No certificates found.
                </p>
            );

        return (
            <div className="p-6">
                <h3 className="text-2xl font-bold mb-6 text-blue-800">Root Certificates</h3>

                {certs.map((rootCa) => {
                    const remaining = daysRemaining(rootCa.valid_until);
                    const isExpanded = expandedRows.has(rootCa.id);
                    const intermediateList = intermediates[rootCa.id] || [];
                    const status = getStatusStyles(rootCa.is_active, remaining);

                    return (
                        <div
                            key={rootCa.id}
                            className="mb-8 border border-gray-200 rounded-xl shadow-md bg-white p-6"
                        >
                            {/* Root CA Header */}
                            <div
                                onClick={() => toggleRow(rootCa.id)}
                                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded-t-xl"
                            >
                                <div className="flex flex-wrap items-center gap-6">
                                    <div
                                        className={`inline-flex items-center px-4 py-1 rounded-full text-base font-semibold ${status.className}`}
                                    >
                                        {status.icon}
                                        <span className="ml-2">{status.text}</span>
                                    </div>

                                    <div className="text-base text-gray-600 font-medium">
                                        <span className="font-semibold">ID:</span> {rootCa.id}
                                    </div>

                                    <div className="text-xl font-bold text-gray-800">
                                        {rootCa.common_name}
                                    </div>

                                    <div
                                        className={`text-base font-medium ${remaining <= 30 ? "text-red-600" : "text-green-600"}`}
                                    >
                                        <span className="font-semibold">Valid Until:</span>{" "}
                                        {new Date(rootCa.valid_until).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="ml-4">
                                    {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                                </div>
                            </div>

                            {/* Expanded Intermediate + Leaf Section */}
                            {isExpanded && (
                                <div >
                                    <h5 className="text-lg font-semibold mb-3 text-blue-800">
                                        Intermediate Certificates
                                    </h5>

                                    {loadingIntermediates[rootCa.id] ? (
                                        <p className="text-gray-600 text-base pl-4">
                                            Loading intermediate certificates...
                                        </p>
                                    ) : intermediateList.length === 0 ? (
                                        <p className="italic text-gray-500 text-base pl-4">
                                            No intermediate CAs found.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {intermediateList.map((int) => {
                                                const intRemaining = daysRemaining(int.valid_until);
                                                const isIntExpanded = expandedIntermediates.has(int.id);
                                                const intStatus = getStatusStyles(int.is_active, intRemaining);

                                                return (
                                                    <div key={int.id} className="pl-4">
                                                        {/* Intermediate header */}
                                                        <div
                                                            className="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-100 rounded-md px-2"
                                                            onClick={() => toggleIntermediate(int.id)}
                                                        >
                                                            <div className="flex flex-wrap items-center gap-4">
                                                                <div
                                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${intStatus.className}`}
                                                                >
                                                                    {intStatus.icon}
                                                                    <span className="ml-4">{intStatus.text}</span>
                                                                </div>

                                                                <div className="text-sm text-gray-600 font-medium">
                                                                    <span className="font-semibold">ID:</span> {int.id}
                                                                </div>

                                                                <div className="text-lg font-semibold text-gray-800">
                                                                    {int.common_name}
                                                                </div>

                                                                <div
                                                                    className={`text-sm font-medium ${intRemaining <= 30 ? "text-red-600" : "text-green-600"}`}
                                                                >
                                                                    <span className="font-semibold">
                                                                        Valid Until  :
                                                                    </span>{" "}
                                                                    {new Date(int.valid_until).toLocaleDateString()}
                                                                </div>
                                                            </div>

                                                            <div className="ml-2">
                                                                {isIntExpanded ? (
                                                                    <ChevronUp size={18} />
                                                                ) : (
                                                                    <ChevronDown size={18} />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Issued Certificates */}
                                                        {isIntExpanded && (
                                                            <div className="ml-6 mt-3 border-l-2 border-gray-200 pl-5 pb-2">
                                                                <h5 className="text-lg font-semibold mb-3 text-blue-800">
                                                                    Issued Certificates
                                                                </h5>

                                                                {int.issued_certificates?.length > 0 ? (
                                                                    <div className="space-y-4">
                                                                        {int.issued_certificates.map((leaf) => {
                                                                            const leafRemaining = daysRemaining(leaf.valid_until);
                                                                            const leafStatus = getStatusStyles(leaf.is_active, leafRemaining);

                                                                            return (
                                                                                <div
                                                                                    key={leaf.id}
                                                                                    className="border border-gray-200 bg-white rounded-lg shadow-sm p-4 hover:bg-gray-50 transition flex justify-between items-center"
                                                                                >
                                                                                    {/* Left section: details */}
                                                                                    <div className="flex flex-wrap items-center gap-5">
                                                                                        <div
                                                                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${leafStatus.className}`}
                                                                                        >
                                                                                            {leafStatus.icon}
                                                                                            <span className="ml-2">{leafStatus.text}</span>
                                                                                        </div>

                                                                                        <div className="text-sm text-gray-700 font-medium">
                                                                                            <span className="font-semibold">ID:</span> {leaf.id}
                                                                                        </div>

                                                                                        <div className="text-base font-semibold text-gray-800">
                                                                                            {leaf.common_name}
                                                                                        </div>

                                                                                        {/* Right section: expiry info */}
                                                                                        {/* <div className="text-sm font-medium text-gray-700"> */}
                                                                                        <span
                                                                                            className={`font-semibold ${leafRemaining <= 30
                                                                                                ? "text-red-600"
                                                                                                : "text-green-600"
                                                                                                }`}
                                                                                        >
                                                                                            Valid Until  :
                                                                                            {new Date(leaf.valid_until).toLocaleDateString()}
                                                                                        </span>{"        "}
                                                                                    </div>

                                                                                </div>
                                                                                // </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <p className="italic text-gray-500 text-sm">
                                                                        No issued certificates.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };



    // --- HELP TAB ---
    const renderHelp = () => (
        <div className="p-10 max-w-3xl mx-auto text-lg leading-relaxed">
            <h2 className="text-3xl font-bold mb-4">Help</h2>
            <p className="mb-4">Use this dashboard to manage VPN certificates:</p>
            <ul className="list-disc pl-8 space-y-2">
                <li><b>My Certificates:</b> View and expand certificate hierarchies.</li>
                <li><b>Alerts:</b> Shows certificates expiring soon.</li>
                <li><b>Download:</b> Retrieve a certificate by its ID.</li>
                <li><b>Server Details:</b> View VPN server configuration linked to your Org ID.</li>
            </ul>
        </div>
    );

    // --- RETURN ---
    return (
        <div className="mt-8 px-48 sm:px-18 pb-12">
            {/* Header */}
            <header className="bg-[#1b2067] text-white py-8 px-8 text-center rounded-lg shadow-md">
                <h1 className="text-5xl font-bold">GoSecure - AnchorVPN</h1>
                <p className="text-blue-200 font-semibold text-3xl mt-2">
                    User Certificate Management
                </p>
                <p className="text-blue-200 font-semibold text-left text-3xl mt-2">Welcome User</p>
            </header>

            {/* Organization ID Section */}
            <div className="flex justify-center mt-10 mb-10">
                <div className="w-1/4 min-w-[300px] text-center">
                    <label className="text-2xl font-bold text-blue-700 mb-3 block">
                        Organization ID
                    </label>
                    <input
                        type="text"
                        placeholder="Enter Org ID"
                        value={orgId}
                        onChange={handleOrgIdChange}
                        className="text-center border border-gray-300 rounded-lg px-4 py-2.5 w-full text-lg font-bold focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                </div>
            </div>

            {/* Main App Layout */}
            <div className="bg-gray-100 min-h-screen flex flex-col rounded-t-2xl shadow-inner">
                {/* Navigation Tabs */}
                <nav className="w-full bg-blue-50 border-b px-10 py-5 flex justify-center gap-x-10">
                    {[
                        { key: "certs", label: "My Certificates" },
                        { key: "alerts", label: "Alerts" },
                        { key: "download", label: "Download" },
                        { key: "server", label: "Server Details" },
                        { key: "help", label: "Help" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`text-2xl font-semibold px-5 py-3 rounded-md transition-colors duration-200 ${activeTab === tab.key
                                ? "text-white bg-[#1b2067]"
                                : "text-blue-800 hover:text-blue-600"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Active Tab Content */}
                <main className="flex-grow p-8">
                    {activeTab === "certs" && renderCertCards()}
                    {activeTab === "alerts" && renderAlerts()}
                    {activeTab === "download" && renderDownloadTab()}
                    {activeTab === "server" && renderServers()}
                    {activeTab === "help" && renderHelp()}
                </main>

                {/* Footer */}
                <footer className="text-center py-4 text-gray-500 text-sm border-t">
                    © GoSecure 2025
                </footer>
            </div>
        </div>
    );

}
