import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

const API_BASE_URL = "https://pre-prod.be.anchorvpn.net/api/v1";

// ------------------ INTERFACES ------------------
export interface LeafCertificate {
    id: string;
    common_name: string;
    valid_until: string;
    serial_number?: string;
    is_active?: boolean;
}

export interface IntermediateCertificate {
    id: string;
    common_name: string;
    valid_until: string;
    serial_number?: string;
    is_active?: boolean;
    issued_certificates?: LeafCertificate[];
}

export interface RootCertificate {
    id: string;
    common_name: string;
    valid_until: string;
    serial_number?: string;
    is_active?: boolean;
    intermediates?: IntermediateCertificate[];
}

interface ServerInfo {
    id: string;
    name: string;
    ip_address: string;
    port?: number;
    status?: string;
    certificate_serial?: string;
    created_at?: string;
    updated_at?: string;
}


// ------------------ MAIN COMPONENT ------------------
export default function UserCertmanager() {
    const [orgId, setOrgId] = useState(localStorage.getItem("orgId") || "");
    const [certs, setCerts] = useState<RootCertificate[]>([]);
    const [intermediates, setIntermediates] = useState<Record<string, IntermediateCertificate[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("certs");
    const [certIdToDownload, setCertIdToDownload] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [downloadMessage, setDownloadMessage] = useState("");
    const [certTypeToDownload, setCertTypeToDownload] = useState("");
    const [servers, setServers] = useState<ServerInfo[]>([]);
    const [serversLoading, setServersLoading] = useState(false);
    const [serversError, setServersError] = useState("");

    const [rootFilter, setRootFilter] = useState("");
    const [intermediateFilter, setIntermediateFilter] = useState("");


    // ------------------ HELPERS ------------------
    const daysRemaining = (validUntil: string | number | Date) => {
        const diff = new Date(validUntil).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const getStatusStyles = (isActive: boolean | undefined, remainingDays: number) => {
        if (!isActive)
            return { text: "Inactive", icon: <Clock size={16} />, className: "bg-gray-200 text-gray-600" };
        if (remainingDays <= 10)
            return { text: "Expiring Soon", icon: <AlertTriangle size={16} />, className: "bg-red-100 text-red-700" };
        if (remainingDays <= 30)
            return { text: "Warning", icon: <AlertTriangle size={16} />, className: "bg-yellow-100 text-yellow-700" };
        return { text: "Active", icon: <CheckCircle size={16} />, className: "bg-green-100 text-green-700" };
    };

    // ------------------ FETCH ALL CERT DATA ------------------
    let currentController: AbortController | null = null;

    const fetchCerts = async () => {
        if (!orgId?.trim()) {
            setCerts([]);
            setIntermediates({});
            return;
        }

        // Cancel previous request (fixes race conditions)
        if (currentController) currentController.abort();
        const controller = new AbortController();
        currentController = controller;
        const signal = controller.signal;

        setLoading(true);
        setError(null);

        try {
            // 1️⃣ Fetch Root CAs
            const res = await axios.get(
                `${API_BASE_URL}/organizations/${orgId}/root-ca/`,
                { signal }
            );

            const rootData: RootCertificate[] = Array.isArray(res.data) ? res.data : [];
            setCerts(rootData);

            if (rootData.length === 0) {
                console.warn("No Root CAs found for org:", orgId);
                setIntermediates({});
                return;
            }

            // 2️⃣ For each root, fetch intermediates + issued certs
            const allIntermediateData: Record<string, IntermediateCertificate[]> = {};

            await Promise.all(
                rootData.map(async (root) => {
                    if (!root?.id) {
                        console.warn("Root CA ID missing! Root:", root);
                        return; // skip this root CA
                    }

                    try {
                        const intRes = await axios.get(
                            `${API_BASE_URL}/root-ca/${root.id}/intermediate-ca/`,
                            { signal }
                        );

                        const intermediates = Array.isArray(intRes.data)
                            ? intRes.data
                            : [];

                        const withIssued = await Promise.all(
                            intermediates.map(async (int) => {
                                if (!int?.id) {
                                    console.warn("Intermediate CA ID missing!", int);
                                    return { ...int, issued_certificates: [] };
                                }

                                try {
                                    const leafRes = await axios.get(
                                        `${API_BASE_URL}/intermediate-ca/${int.id}/certificates/`,
                                        { signal }
                                    );

                                    return {
                                        ...int,
                                        issued_certificates: Array.isArray(leafRes.data)
                                            ? leafRes.data
                                            : [],
                                    };
                                } catch {
                                    return { ...int, issued_certificates: [] };
                                }
                            })
                        );

                        allIntermediateData[root.id] = withIssued;
                    } catch (error) {
                        console.warn("Failed intermediates for root:", root.id);
                        allIntermediateData[root.id] = [];
                    }
                })
            );

            // 3️⃣ Update state only if NOT aborted
            if (!signal.aborted) {
                setIntermediates(allIntermediateData);
            }
        } catch (err: any) {
            if (err.name === "CanceledError" || err.name === "AbortError") {
                console.log("Fetch aborted because orgId changed.");
                return;
            }

            console.error("fetchCerts error", err);
            setError("Failed to fetch certificates. Check Org ID.");
            setCerts([]);
            setIntermediates({});
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    };

    // ------------------ EFFECTS ------------------
    useEffect(() => {
        if (activeTab === "certs") fetchCerts();
    }, [activeTab, orgId]);

    useEffect(() => {
        if (activeTab === "alerts") fetchCerts();
    }, [activeTab, orgId]);
    useEffect(() => {
        if (activeTab === "server") {
            console.log("Servers tab activated");
            fetchServers();
        }
    }, [activeTab]);


    // ------------------ HANDLERS ------------------
    const handleOrgIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setOrgId(value);
        localStorage.setItem("orgId", value);
    };

    console.log('days remaining', daysRemaining)



    // ------------------ TABLE RENDER ------------------
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
            <div className="p-8 bg-white rounded-xl shadow-lg">
                <h3 className="text-3xl font-bold mb-8 text-blue-900 text-center">
                    My certificates
                </h3>

                <table className="w-full border border-gray-300 border-collapse">
                    <thead className="text-white text-lg">
                        <tr>
                            <th className="bg-[#1e28b6] border border-blue-300 px-6 py-3 text-left w-1/3">
                                Root Certificates
                            </th>
                            <th className="bg-[#1e28b6] border border-blue-400 px-6 py-3 text-left w-1/3">
                                Intermediate Certificates
                            </th>
                            <th className="bg-[#1e28b6] border border-blue-500 px-6 py-3 text-left w-1/3">
                                Issued Certificates
                            </th>
                        </tr>
                    </thead>


                    <tbody>
                        {certs.map((rootCa) => {
                            const remaining = daysRemaining(rootCa.valid_until);
                            const status = getStatusStyles(rootCa.is_active, remaining);
                            const intermediateList = intermediates[rootCa.id] || [];
                            <div className="flex items-center space-x-6 mb-6">

                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                                        Filter by Root CA ID
                                    </label>
                                    <input
                                        type="text"
                                        className="border px-4 py-2 rounded-lg w-48"
                                        placeholder="e.g. 8"
                                        value={rootFilter}
                                        onChange={(e) => setRootFilter(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                                        Filter by Intermediate CA ID
                                    </label>
                                    <input
                                        type="text"
                                        className="border px-4 py-2 rounded-lg w-48"
                                        placeholder="e.g. 12"
                                        value={intermediateFilter}
                                        onChange={(e) => setIntermediateFilter(e.target.value)}
                                    />
                                </div>

                            </div>

                            return (
                                <tr key={rootCa.id} className="align-top hover:bg-gray-50">

                                    {/* ROOT COLUMN */}
                                    <td className="border border-gray-300 px-6 py-6 align-top w-1/3">
                                        <div className="flex flex-col space-y-4">

                                            <div className={`inline-flex items-center self-start px-4 py-2 rounded-full text-base font-semibold ${status.className}`}>
                                                {status.icon}
                                                <span className="ml-2">{status.text}</span>
                                            </div>

                                            <div className="text-2xl text-blue-900 font-bold">{rootCa.common_name}</div>
                                            <div className="text-xl text-gray-700 font-medium">ID: {rootCa.id}</div>

                                            <div className={`text-xl font-semibold ${remaining <= 30 ? "text-red-600" : "text-green-600"}`}>
                                                Expires: {new Date(rootCa.valid_until).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>

                                    {/* INTERMEDIATE COLUMN */}
                                    <td className="border border-gray-300 px-6 py-6 align-top w-1/3">
                                        {intermediateList.length === 0 ? (
                                            <p className="italic text-gray-500 text-lg">No intermediate CAs found.</p>
                                        ) : (
                                            <div className="space-y-6">
                                                {intermediateList.map((int) => {
                                                    const intRemaining = daysRemaining(int.valid_until);
                                                    const intStatus = getStatusStyles(int.is_active, intRemaining);

                                                    return (
                                                        <div
                                                            key={int.id}
                                                            className="rounded-lg border border-gray-200 p-5 bg-gray-50 hover:bg-gray-100 transition"
                                                        >
                                                            <div
                                                                className={`inline-flex items-center mb-3 px-4 py-2 rounded-full text-base font-semibold ${intStatus.className}`}
                                                            >
                                                                {intStatus.icon}
                                                                <span className="ml-2">{intStatus.text}</span>
                                                            </div>

                                                            <div className="text-2xl text-blue-800 font-bold">{int.common_name}</div>
                                                            <div className="text-xl text-gray-700 font-medium">ID: {int.id}</div>

                                                            <div className={`text-xl font-semibold ${intRemaining <= 30 ? "text-red-600" : "text-green-600"}`}>
                                                                Expires: {new Date(int.valid_until).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </td>

                                    {/* ISSUED CERTIFICATES COLUMN */}
                                    <td className="border border-gray-300 px-6 py-6 align-top w-1/3">
                                        {intermediateList.length === 0 ? (
                                            <p className="italic text-gray-500 text-lg">No issued certificates found.</p>
                                        ) : (
                                            <div className="space-y-6">
                                                {intermediateList.map((int) =>
                                                    int.issued_certificates && int.issued_certificates.length > 0 ? (
                                                        <div
                                                            key={int.id}
                                                            className="rounded-lg border border-gray-200 p-5 bg-gray-50 hover:bg-gray-100 transition"
                                                        >
                                                            <div className="text-2xl text-blue-700 font-semibold mb-3">
                                                                {int.common_name} — Issued Certificates
                                                            </div>

                                                            {int.issued_certificates.map((leaf) => {
                                                                const leafRemaining = daysRemaining(leaf.valid_until);
                                                                const leafStatus = getStatusStyles(leaf.is_active, leafRemaining);

                                                                return (
                                                                    <div
                                                                        key={leaf.id}
                                                                        className="mb-6 pl-3 border-l-4 border-blue-200"
                                                                    >
                                                                        <div
                                                                            className={`inline-flex items-center mb-2 px-4 py-2 rounded-full text-base font-semibold ${leafStatus.className}`}
                                                                        >
                                                                            {leafStatus.icon}
                                                                            <span className="ml-2">{leafStatus.text}</span>
                                                                        </div>

                                                                        <div className="text-2xl font-bold text-blue-900">
                                                                            {leaf.common_name}
                                                                        </div>
                                                                        <div className="text-xl text-gray-700 font-medium">
                                                                            ID: {leaf.id}
                                                                        </div>

                                                                        <div className={`text-xl font-semibold ${leafRemaining <= 30 ? "text-red-600" : "text-green-600"}`}>
                                                                            Expires: {new Date(leaf.valid_until).toLocaleDateString()}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : null
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>


                            );
                        })}
                    </tbody>

                </table>
            </div>
        );
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



    const renderAlerts = () => {
        const EXPIRY_THRESHOLD = 1500; // show certs expiring in 30 days///////////////////////////////////////

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
            <div className="p-8 bg-white rounded-xl shadow-lg">
                <h3 className="text-3xl font-bold mb-8 text-red-700 text-center">
                    Expiring Certificates
                </h3>

                <table className="w-full border border-gray-300 border-collapse">
                    <thead className="text-white text-lg">
                        <tr>
                            <th className="bg-red-400 px-6 py-3 text-left w-1/3">Root CA</th>
                            <th className="bg-red-400 px-6 py-3 text-left w-1/3">Intermediate CAs</th>
                            <th className="bg-red-400 px-6 py-3 text-left w-1/3">Issued Certificates</th>
                        </tr>
                    </thead>

                    <tbody>
                        {certs.map((rootCa) => {
                            const rootRemaining = daysRemaining(rootCa.valid_until);
                            const intList = intermediates[rootCa.id] || [];

                            const rootExpiring = rootRemaining <= EXPIRY_THRESHOLD;

                            // Check if any intermediate or issued certs expire soon
                            const intermediateExpiring = intList.some(
                                (int) => daysRemaining(int.valid_until) <= EXPIRY_THRESHOLD
                            );

                            const issuedExpiring = intList.some((int) =>
                                int.issued_certificates?.some(
                                    (leaf) => daysRemaining(leaf.valid_until) <= EXPIRY_THRESHOLD
                                )
                            );

                            // If nothing under this root CA is expiring, skip row
                            if (!rootExpiring && !intermediateExpiring && !issuedExpiring)
                                return null;

                            return (
                                <tr key={rootCa.id} className="align-top hover:bg-gray-50">

                                    {/* ROOT COLUMN */}
                                    <td className="border border-gray-300 px-6 py-6 align-top">
                                        {rootExpiring ? (
                                            <div className="space-y-2 p-4 bg-red-100 border border-red-300 rounded-lg">
                                                <div className="text-2xl font-bold text-red-800">
                                                    {rootCa.common_name}
                                                </div>
                                                <div className="text-lg text-gray-700">
                                                    ID: {rootCa.id}
                                                </div>
                                                <div className="text-lg text-red-600 font-semibold">
                                                    Expires: {new Date(rootCa.valid_until).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="italic text-gray-400">No expiring root CA.</p>
                                        )}
                                    </td>

                                    {/* INTERMEDIATES COLUMN */}
                                    <td className="border border-gray-300 px-6 py-6 align-top">
                                        {intList
                                            .filter((int) => daysRemaining(int.valid_until) <= EXPIRY_THRESHOLD)
                                            .map((int) => (
                                                <div
                                                    key={int.id}
                                                    className="mb-4 p-4 bg-orange-100 border border-orange-300 rounded-lg"
                                                >
                                                    <div className="text-xl font-semibold text-orange-800">
                                                        {int.common_name}
                                                    </div>
                                                    <div className="text-lg text-gray-700">ID: {int.id}</div>
                                                    <div className="text-lg text-red-600 font-semibold">
                                                        Expires: {new Date(int.valid_until).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}

                                        {intList.filter((int) => daysRemaining(int.valid_until) <= EXPIRY_THRESHOLD).length === 0 && (
                                            <p className="italic text-gray-400">No expiring intermediates.</p>
                                        )}
                                    </td>

                                    {/* ISSUED CERTIFICATES COLUMN */}
                                    <td className="border border-gray-300 px-6 py-6 align-top">
                                        {intList.map((int) =>
                                            int.issued_certificates
                                                ?.filter((leaf) => daysRemaining(leaf.valid_until) <= EXPIRY_THRESHOLD)
                                                .map((leaf) => (
                                                    <div
                                                        key={leaf.id}
                                                        className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg"
                                                    >
                                                        <div className="text-xl font-semibold text-yellow-800">
                                                            {leaf.common_name}
                                                        </div>
                                                        <div className="text-lg text-gray-700">ID: {leaf.id}</div>
                                                        <div className="text-lg text-red-600 font-semibold">
                                                            Expires: {new Date(leaf.valid_until).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))
                                        )}

                                        {intList.every(
                                            (int) =>
                                                !int.issued_certificates?.some(
                                                    (leaf) => daysRemaining(leaf.valid_until) <= EXPIRY_THRESHOLD
                                                )
                                        ) && (
                                                <p className="italic text-gray-400">No expiring issued certs.</p>
                                            )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
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
    const fetchServers = async () => {
        console.log("Calling server API...");
        try {
            setServersLoading(true);
            setServersError("");

            const res = await axios.get(`${API_BASE_URL}/certificates/server/`);

            setServers(res.data?.data || []);   // backend uses { data: [...] }
        } catch (e) {
            setServers([]);
            setServersError("Failed to load server details.");
        } finally {
            setServersLoading(false);
        }
    };

    const renderServers = () => (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">Server Details</h2>

            {serversLoading && (
                <p className="text-gray-500">Loading server details…</p>
            )}

            {serversError && (
                <p className="text-red-600 font-medium">{serversError}</p>
            )}

            {!serversLoading && !serversError && servers.length === 0 && (
                <p className="text-gray-500 italic">No server details available.</p>
            )}

            <div className="space-y-4">
                {servers.map((s) => (
                    <div
                        key={s.id}
                        className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                    >
                        <h3 className="text-xl font-semibold mb-2">
                            {s.name || "Unnamed Server"}
                        </h3>

                        <div className="grid grid-cols-2 gap-4 text-sm">

                            <div>
                                <span className="font-medium">IP Address:</span>{" "}
                                {s.ip_address}
                            </div>

                            {s.port && (
                                <div>
                                    <span className="font-medium">Port:</span>{" "}
                                    {s.port}
                                </div>
                            )}

                            {s.status && (
                                <div>
                                    <span className="font-medium">Status:</span>{" "}
                                    {s.status}
                                </div>
                            )}

                            {s.certificate_serial && (
                                <div>
                                    <span className="font-medium">Cert Serial:</span>{" "}
                                    {s.certificate_serial}
                                </div>
                            )}

                            {s.created_at && (
                                <div>
                                    <span className="font-medium">Created:</span>{" "}
                                    {new Date(s.created_at).toLocaleString()}
                                </div>
                            )}

                            {s.updated_at && (
                                <div>
                                    <span className="font-medium">Updated:</span>{" "}
                                    {new Date(s.updated_at).toLocaleString()}
                                </div>
                            )}

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );


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
        <div className="p-8 bg-white rounded-xl shadow-lg w-[75%] mx-auto">
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
                    {activeTab === "alerts" && renderAlerts({ certs, intermediates })}
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
