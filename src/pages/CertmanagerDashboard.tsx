import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock, Download } from "lucide-react";

// The specific API base URL provided
const API_BASE_URL = "https://pre-prod.be.anchorvpn.net/api/v1";

// Interfaces are fine, no change needed here
interface Certificate {
    id: string;
    common_name: string;
    serial_number: string;
    valid_until: string;
    is_active: boolean;
    // optional created_at etc if present
}

interface IntermediateCA extends Certificate {
    issued_certificates?: Certificate[];
}

export default function UserDashboard(): JSX.Element {
    const [activeTab, setActiveTab] = useState<"certs" | "alerts" | "download" | "help">("certs");
    const [certs, setCerts] = useState<Certificate[]>([]);
    const [intermediates, setIntermediates] = useState<
        Record<string, IntermediateCA[]>
    >({});
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [expandedIntermediates, setExpandedIntermediates] = useState<
        Set<string>
    >(new Set());
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingIntermediates, setLoadingIntermediates] = useState<
        Record<string, boolean>
    >({});
    const [error, setError] = useState<string | null>(null);
    const [orgId, setOrgId] = useState(() => localStorage.getItem("orgId") || "1");


    // For download tab
    const [downloadType, setDownloadType] = useState("root");
    const [certIdToDownload, setCertIdToDownload] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [downloadMessage, setDownloadMessage] = useState("");


    // Helper function to fetch root CAs (certs)
    const fetchCerts = async (): Promise<void> => {
        if (!orgId?.trim()) {
            setCerts([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get<Certificate[]>(
                `${API_BASE_URL}/organizations/${orgId}/root-ca/` // CORRECTED URL
            );
            setCerts(res.data || []);
        } catch (err: any) {
            console.error("fetchCerts error", err);
            setError(err?.response?.data?.detail || err?.message || "Failed to fetch certificates.");
            setCerts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "certs" || activeTab === "alerts") {
            fetchCerts();
        }
    }, [activeTab, orgId]);

    const handleOrgIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setOrgId(value);
        localStorage.setItem("orgId", value);
    };

    // days remaining helper
    const daysRemaining = (validUntil: string): number => {
        const diff = new Date(validUntil).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    // fetch intermediates for a root CA, and for each intermediate fetch its issued certs
    const fetchIntermediates = async (rootCaId: string) => {
        setLoadingIntermediates((p) => ({ ...p, [rootCaId]: true }));
        setError(null);
        try {
            // 1) fetch intermediates
            const res = await axios.get<IntermediateCA[]>(
                `${API_BASE_URL}/root-ca/${rootCaId}/intermediate-ca/` // CORRECTED URL
            );
            const ints: IntermediateCA[] = res.data || [];

            // 2) for each intermediate fetch its issued certificates (in parallel)
            const issuedPromises = ints.map(async (int) => {
                try {
                    const r = await axios.get<Certificate[]>(
                        `${API_BASE_URL}/intermediate-ca/${int.id}/certificates/` // CORRECTED URL
                    );
                    return { ...int, issued_certificates: r.data || [] } as IntermediateCA;
                } catch (err) {
                    // if intermediate has no issued certs or call fails, keep empty
                    return { ...int, issued_certificates: [] } as IntermediateCA;
                }
            });

            const intsWithIssued = await Promise.all(issuedPromises);

            setIntermediates((prev) => ({ ...prev, [rootCaId]: intsWithIssued }));
        } catch (err: any) {
            console.error("fetchIntermediates error", err);
        } finally {
            setLoadingIntermediates((p) => ({ ...p, [rootCaId]: false }));
        }
    };

    // Toggle root row expansion. If expanding and we haven't fetched intermediates, fetch them.
    const toggleRow = (rootCaId: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            const isExpanding = !next.has(rootCaId);
            if (isExpanding) {
                next.add(rootCaId);
                // Check if data is already present to avoid unnecessary re-fetch
                if (!intermediates[rootCaId]) {
                    fetchIntermediates(rootCaId);
                }
            } else {
                next.delete(rootCaId);
            }
            return next;
        });
    };

    // Toggle intermediate expansion (its issued certificates are already fetched in fetchIntermediates)
    const toggleIntermediate = (intermediateId: string) => {
        setExpandedIntermediates((prev) => {
            const next = new Set(prev);
            if (next.has(intermediateId)) next.delete(intermediateId);
            else next.add(intermediateId);
            return next;
        });
    };

    // Helper function to determine badge styles
    const getStatusStyles = (isActive: boolean, remainingDays: number) => {
        if (!isActive) {
            return {
                text: "Inactive",
                icon: <Clock size={16} className="mr-1" />,
                className: "bg-gray-200 text-gray-600",
            };
        }
        if (remainingDays <= 10) {
            return {
                text: "Expiring Soon",
                icon: <AlertTriangle size={16} className="mr-1" />,
                className: "bg-red-100 text-red-700",
            };
        }
        if (remainingDays <= 30) {
            return {
                text: "Warning",
                icon: <AlertTriangle size={16} className="mr-1" />,
                className: "bg-yellow-100 text-yellow-700",
            };
        }
        return {
            text: "Active",
            icon: <CheckCircle size={16} className="mr-1" />,
            className: "bg-green-100 text-green-700",
        };
    };



    // --- Download Handler ---
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
        } catch (err: any) {
            console.error("Download failed", err);
            setDownloadMessage("Failed to download certificate. Check the ID.");
        } finally {
            setDownloading(false);
        }
    };


    // Cards renderer (unified layout, large text, dark/light/blue mode compatible)
    const renderCertCards = (data: Certificate[]) => {
        return (
            <div
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors w-full"
            >
                {data.length === 0 ? (
                    <p className="text-lg text-gray-500 dark:text-gray-400 italic">
                        No certificates found.
                    </p>
                ) : (
                    data.map((rootCa) => {
                        const remaining = daysRemaining(rootCa.valid_until);
                        const isExpanded = expandedRows.has(rootCa.id);
                        const intermediateList = intermediates[rootCa.id];
                        const { text, className } = getStatusStyles(rootCa.is_active, remaining);
                        const commonName = rootCa.common_name
                            .replace("Test Root CA", "Root CA")
                            .replace("Test Organization Root CA Renewed", "Org Root CA");

                        return (
                            <div key={rootCa.id} className="mb-6 w-full">
                                {/* Root CA Row */}
                                <div
                                    className={`p-5 rounded-xl cursor-pointer flex justify-between items-center hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors w-full ${isExpanded ? 'bg-blue-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                                        }`}
                                    onClick={() => toggleRow(rootCa.id)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:gap-x-8 gap-y-2 flex-grow w-full">
                                        <span className="font-extrabold text-2xl text-blue-800 dark:text-blue-300 flex items-center">
                                            ID: {rootCa.id}
                                        </span>
                                        <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                            {commonName}
                                        </span>
                                        <div
                                            className={`inline-flex items-center text-base font-bold px-4 py-1 rounded-full ${className} ml-auto md:ml-0`}
                                        >
                                            {text}
                                        </div>
                                        <span
                                            className={`text-lg font-medium ml-auto md:ml-0 ${remaining <= 30 ? 'text-red-500' : 'text-green-600'
                                                }`}
                                        >
                                            {remaining} days left
                                        </span>
                                    </div>
                                    <button
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 ml-4 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
                                        aria-label={isExpanded ? "Collapse Root CA" : "Expand Root CA"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleRow(rootCa.id);
                                        }}
                                    >
                                        {isExpanded ? <ChevronUp size={26} /> : <ChevronDown size={26} />}
                                    </button>
                                </div>

                                {/* Intermediate + Leaf Section */}
                                {isExpanded && (
                                    <div className="ml-10 mt-4 border-l-4 border-blue-300 dark:border-gray-600 pl-6 pr-6 w-full">
                                        {loadingIntermediates[rootCa.id] ? (
                                            <p className="text-lg text-gray-500 dark:text-gray-400">
                                                Loading intermediates...
                                            </p>
                                        ) : intermediateList && intermediateList.length > 0 ? (
                                            intermediateList.map((int) => {
                                                const intRemaining = daysRemaining(int.valid_until);
                                                const isIntExpanded = expandedIntermediates.has(int.id);
                                                const intStatus = getStatusStyles(int.is_active, intRemaining);
                                                return (
                                                    <div key={int.id} className="mb-4 w-full">
                                                        {/* Intermediate Row */}
                                                        <div
                                                            className="flex justify-between items-center py-3 px-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors w-full"
                                                            onClick={() => toggleIntermediate(int.id)}
                                                        >
                                                            <div className="flex flex-col md:flex-row md:items-center md:gap-x-6 flex-grow w-full">
                                                                <span className="font-bold text-xl text-gray-800 dark:text-gray-100">
                                                                    ID: {int.id}
                                                                </span>
                                                                <span className="text-lg text-gray-700 dark:text-gray-300">
                                                                    {int.common_name}
                                                                </span>
                                                                <div
                                                                    className={`inline-flex items-center text-sm font-bold px-3 py-1 rounded-full ${intStatus.className} ml-auto md:ml-0`}
                                                                >
                                                                    {intStatus.text}
                                                                </div>
                                                                <span
                                                                    className={`text-lg font-medium ml-auto md:ml-0 ${intRemaining <= 30
                                                                        ? 'text-red-500'
                                                                        : 'text-green-600'
                                                                        }`}
                                                                >
                                                                    {intRemaining} days left
                                                                </span>
                                                            </div>
                                                            <button
                                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 ml-4 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleIntermediate(int.id);
                                                                }}
                                                            >
                                                                {isIntExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                                                            </button>
                                                        </div>

                                                        {/* Leaf Certificates */}
                                                        {isIntExpanded && (
                                                            <div className="ml-8 mt-2 border-l-2 border-gray-300 dark:border-gray-600 pl-5 pr-6 w-full">
                                                                {int.issued_certificates && int.issued_certificates.length > 0 ? (
                                                                    int.issued_certificates.map((leaf) => {
                                                                        const leafDays = daysRemaining(leaf.valid_until);
                                                                        const leafStatus = getStatusStyles(leaf.is_active, leafDays);
                                                                        return (
                                                                            <div
                                                                                key={leaf.id}
                                                                                className="w-full px-6 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-md"
                                                                            >
                                                                                <div>
                                                                                    <div className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                                                                                        {leaf.common_name}
                                                                                    </div>
                                                                                    <div className="text-lg text-gray-500 dark:text-gray-400">
                                                                                        ID: {leaf.id}
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex flex-col items-end pr-2">
                                                                                    <div
                                                                                        className={`inline-flex items-center text-sm font-bold px-3 py-1 rounded-full ${leafStatus.className}`}
                                                                                    >
                                                                                        {leafStatus.text}
                                                                                    </div>
                                                                                    <span
                                                                                        className={`text-sm font-medium ${leafDays <= 30
                                                                                            ? 'text-red-500'
                                                                                            : 'text-green-600'
                                                                                            }`}
                                                                                    >
                                                                                        {leafDays} days left
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <p className="text-sm italic text-gray-400 dark:text-gray-500">
                                                                        No issued certificates found.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-lg italic text-gray-500 dark:text-gray-400">
                                                No intermediate CAs found.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        );
    };

    // Alerts list (expiring soon)
    const renderAlerts = () => {
        const expiring = certs.filter(
            (r) => daysRemaining(r.valid_until) <= 30 && r.is_active
        ).sort((a, b) => daysRemaining(a.valid_until) - daysRemaining(b.valid_until));

        return (
            <div className="space-y-4">
                {expiring.length === 0 ? (
                    <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                        <p className="text-green-700 font-semibold flex items-center justify-center">
                            <CheckCircle size={20} className="mr-2" />
                            All active certificates are valid for more than 30 days.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">The following **{expiring.length}** active certificates are expiring within the next 30 days.</p>
                        {expiring.map((c) => {
                            const days = daysRemaining(c.valid_until);
                            const isCritical = days <= 10;
                            return (
                                <div key={c.id} className={`p-4 rounded-lg shadow-md transition-shadow duration-300 ${isCritical ? 'bg-red-50 border-l-4 border-red-600' : 'bg-yellow-50 border-l-4 border-yellow-600'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-lg text-gray-800">{c.common_name}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                ID: {c.id} | Serial: {c.serial_number}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xl font-extrabold ${isCritical ? 'text-red-700' : 'text-yellow-700'}`}>{days}</div>
                                            <div className={`text-sm font-medium ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}>DAYS LEFT</div>
                                        </div>
                                    </div>
                                    {isCritical && (
                                        <p className="text-xs text-red-500 mt-2 flex items-center">
                                            <AlertTriangle size={14} className="mr-1" /> **CRITICAL:** Immediate action is required for renewal.
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };







    // --- Download tab UI ---
    const renderDownloadTab = () => (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-6">Download Certificate</h2>

            <div className="space-y-5">
                <div>
                    <label className="block text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                        Select Certificate Type
                    </label>
                    <select
                        value={downloadType}
                        onChange={(e) => setDownloadType(e.target.value)}
                        className="w-full text-lg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="root">Root CA</option>
                        <option value="intermediate">Intermediate CA</option>
                        <option value="leaf">Issued Certificate</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                        Enter Certificate ID
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., 12345"
                        value={certIdToDownload}
                        onChange={(e) => setCertIdToDownload(e.target.value)}
                        className="w-full text-lg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-center dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center"
                >
                    <Download size={24} className="mr-2" />
                    {downloading ? "Downloading..." : "Download Certificate"}
                </button>

                {downloadMessage && (
                    <p className="mt-4 text-lg font-medium text-blue-700 dark:text-blue-300">{downloadMessage}</p>
                )}
            </div>
        </div>
    );





    return (
        <div className="mt-8 px-48 sm:px-18 pb-12">
            {/* Header */}
            <header className="bg-[#1b2067] dark:bg-[#0f143d] text-white py-8 px-8 shadow-sm border-b border-blue-200 text-center">
                <h1 className="text-5xl font-bold">GoSecure - AnchorVPN</h1>
                <p className="text-blue-200 font-semibold text-3xl mt-2 dark:text-blue-400">
                    User Certificate Management
                </p>
            </header>


            <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
                    {/* Sidebar */}
                    <aside className="w-84 bg-blue-50 dark:bg-[#10163f] border-r border-blue-200 dark:border-gray-700 p-6 flex flex-col justify-between">
                        <div>
                            {/* Username / Heading */}
                            <div className="mb-8 text-center">
                                <h2 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">
                                    Welcome, User
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Dashboard Menu
                                </p>
                            </div>

                            {/* Navigation Tabs */}
                            <nav className="space-y-4">
                                {[
                                    { key: "certs", label: "My Certificates", hover: "hover:text-blue-600" },
                                    { key: "alerts", label: "Alerts", hover: "hover:text-red-600" },
                                    { key: "download", label: "Download", hover: "hover:text-green-600" },
                                    { key: "help", label: "Help", hover: "hover:text-purple-600" },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key as any)}
                                        className={`w-full text-left text-2xl font-semibold px-5 py-3 rounded-md transition-all duration-200
                            ${activeTab === tab.key
                                                ? "text-white bg-[#1b2067] dark:bg-[#0f143d]"
                                                : `bg-blue-100 dark:bg-blue-900 text-gray-700 dark:text-gray-200 ${tab.hover}`
                                            }`}
                                    >
                                        {tab.label}

                                        {tab.key === "alerts" &&
                                            certs.filter((r) => daysRemaining(r.valid_until) <= 30 && r.is_active).length > 0 && (
                                                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-sm font-bold leading-none text-white bg-red-600 rounded-full">
                                                    {certs.filter((r) => daysRemaining(r.valid_until) <= 30 && r.is_active).length}
                                                </span>
                                            )}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Footer */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">
                            © GoSecure 2025
                        </p>
                    </aside>
                </div>



                {/* Main Content */}
                <main className="flex-1 p-10 text-gray-900 dark:text-gray-100">
                    <div className="mb-8">
                        <label className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2 block">
                            Organization ID
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Org ID"
                            value={orgId}
                            onChange={handleOrgIdChange}
                            className="text-center border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-4 py-2.5 w-64 text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                    {/* Main Content */}
                    <main className="flex-1 p-10 text-gray-900 dark:text-gray-100">
                        {activeTab === "certs"
                            ? renderCertCards(certs)
                            : activeTab === "alerts"
                                ? renderAlerts()
                                : activeTab === "download"
                                    ? renderDownloadTab()
                                    : <p className="text-2xl text-center text-gray-600">Help section coming soon.</p>}
                    </main>
                </main>
            </div>
        </div>
    );

}