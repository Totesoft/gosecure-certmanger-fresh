import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'; // Using lucide-react for icons

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

export default function AnchorVPNUserDashboard(): JSX.Element {
    const [activeTab, setActiveTab] = useState<"certs" | "alerts">("certs");
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

    // Cards renderer (horizontal layout)
    const renderCertCards = (data: Certificate[]) => {
        return (
            <div className="space-y-4">
                {data.map((rootCa) => {
                    const remaining = daysRemaining(rootCa.valid_until);
                    const isExpanded = expandedRows.has(rootCa.id);
                    const intermediateList = intermediates[rootCa.id];
                    const { text, icon, className } = getStatusStyles(rootCa.is_active, remaining);
                    const commonName = rootCa.common_name.replace("Test Root CA", "Root CA").replace("Test Organization Root CA Renewed", "Org Root CA");


                    return (
                        <div
                            key={rootCa.id}
                            className={`bg-white rounded-xl shadow-lg transition-shadow duration-300 overflow-hidden ${isExpanded ? 'shadow-xl' : ''}`}
                        >
                            {/* Root CA Header */}
                            <div className={`p-4 border-l-4 ${rootCa.is_active ? 'border-blue-600' : 'border-gray-400'} flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors`} onClick={() => toggleRow(rootCa.id)}>
                                <div className="flex flex-col md:flex-row md:items-center md:gap-x-6 gap-y-2 flex-grow">
                                    <span className="font-extrabold text-lg text-blue-800 flex items-center">
                                        <span className="hidden md:inline text-sm font-semibold mr-2 text-gray-400">ID:</span> {rootCa.id}
                                    </span>
                                    <span className="text-gray-700 font-semibold truncate max-w-xs md:max-w-none">
                                        {commonName}
                                    </span>
                                    <div className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${className} ml-auto md:ml-0`}>
                                        {icon}
                                        <span>{text}</span>
                                    </div>
                                    <span className={`text-sm font-medium ml-auto md:ml-0 ${remaining <= 30 ? 'text-red-500' : 'text-green-600'}`}>
                                        {remaining} days left
                                    </span>
                                </div>
                                <button
                                    className="text-blue-600 hover:text-blue-800 ml-4 p-1 rounded-full hover:bg-blue-100 transition-colors"
                                    aria-label={isExpanded ? "Collapse Root CA" : "Expand Root CA"}
                                    onClick={(e) => { e.stopPropagation(); toggleRow(rootCa.id); }} // Stop propagation to prevent double-toggle
                                >
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>

                            {/* Intermediate CAs */}
                            {isExpanded && (
                                <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50">
                                    <div className="py-2 text-sm font-bold text-gray-600">
                                        Intermediate CAs
                                    </div>
                                    {loadingIntermediates[rootCa.id] ? (
                                        <p className="text-gray-500 text-sm p-2">Loading intermediates...</p>
                                    ) : intermediateList && intermediateList.length > 0 ? (
                                        <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                                            {intermediateList.map((int) => {
                                                const intRemaining = daysRemaining(int.valid_until);
                                                const isIntExpanded = expandedIntermediates.has(int.id);
                                                const intStatus = getStatusStyles(int.is_active, intRemaining);
                                                return (
                                                    <div
                                                        key={int.id}
                                                        className="border border-gray-100 rounded-lg p-3 bg-white shadow-sm"
                                                    >
                                                        {/* Intermediate Row */}
                                                        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleIntermediate(int.id)}>
                                                            <div className="flex flex-col md:flex-row md:items-center md:gap-x-4 flex-grow text-sm">
                                                                <span className="font-bold text-gray-800">
                                                                    <span className="hidden md:inline text-xs font-medium mr-1 text-gray-400">ID:</span> {int.id}
                                                                </span>
                                                                <span className="text-gray-600 truncate max-w-xs md:max-w-none">
                                                                    {int.common_name}
                                                                </span>
                                                                <div className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${intStatus.className} ml-auto md:ml-0`}>
                                                                    {intStatus.icon}
                                                                    <span>{intStatus.text}</span>
                                                                </div>
                                                                <span className={`text-xs font-medium ml-auto md:ml-0 ${intRemaining <= 30 ? 'text-red-500' : 'text-green-600'}`}>
                                                                    {intRemaining} days left
                                                                </span>
                                                            </div>

                                                            <button
                                                                className="text-blue-600 hover:text-blue-800 ml-4 p-1 rounded-full hover:bg-blue-100 transition-colors"
                                                                aria-label={isIntExpanded ? "Collapse intermediate" : "Expand intermediate"}
                                                                onClick={(e) => { e.stopPropagation(); toggleIntermediate(int.id); }}
                                                            >
                                                                {isIntExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                            </button>
                                                        </div>

                                                        {/* Issued Certificates for Intermediate */}
                                                        {isIntExpanded && (
                                                            <div className="mt-3 pl-4 border-l-2 border-gray-100">
                                                                {int.issued_certificates && int.issued_certificates.length > 0 ? (
                                                                    <div className="space-y-2 text-sm text-gray-700 pt-2">
                                                                        <div className="text-xs font-bold text-gray-500 mb-1">Issued Certificates ({int.issued_certificates.length})</div>
                                                                        {int.issued_certificates.map((leaf) => {
                                                                            const leafDays = daysRemaining(leaf.valid_until);
                                                                            const leafStatus = getStatusStyles(leaf.is_active, leafDays);
                                                                            return (
                                                                                <div
                                                                                    key={leaf.id}
                                                                                    className="p-2 border-b border-gray-50 last:border-b-0 flex justify-between items-center"
                                                                                >
                                                                                    <div className="flex flex-col gap-1">
                                                                                        <div className="font-semibold text-gray-700 truncate max-w-xs">
                                                                                            {leaf.common_name}
                                                                                        </div>
                                                                                        <div className="text-xs text-gray-500">
                                                                                            ID: {leaf.id} | Serial: {leaf.serial_number}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex flex-col items-end gap-1">
                                                                                        <div className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${leafStatus.className}`}>
                                                                                            {leafStatus.text}
                                                                                        </div>
                                                                                        <span className={`text-xs font-medium ${leafDays <= 30 ? 'text-red-500' : 'text-green-600'}`}>
                                                                                            {leafDays} days left
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs italic text-gray-400 p-2">
                                                                        No issued certificates found for this intermediate.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic p-2">
                                            No intermediate CAs found.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
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

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Header */}
            <header className="bg-blue-100 text-blue-800 py-10 px-8 shadow-sm border-b border-blue-200 text-center">
                <h1 className="text-3xl font-bold">GoSecure - AnchorVPN</h1>
                <p className="text-blue-700 font-bold text-lg mt-2">User Certificate Management</p>
            </header>

            <hr className="my-0" />

            {/* Organisation Input + Tabs */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-8 pt-4">
                    <div className="flex items-center space-x-4 mb-4">
                        <label className="text-gray-700 font-lg font-bold">Organization ID:</label>
                        <input
                            type="text"
                            placeholder="Enter Org ID"
                            value={orgId}
                            onChange={handleOrgIdChange}
                            className="border border-gray-300 rounded-lg px-3 py-2 w-40 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="flex space-x-1 pb-0.5">
                        <button
                            onClick={() => setActiveTab("certs")}
                            className={`py-3 px-6 font-semibold text-sm transition-colors duration-200 ${activeTab === "certs" ? "border-b-4 border-blue-600 text-blue-700 bg-gray-50 rounded-t-lg" : "text-gray-500 hover:text-blue-600"}`}
                        >
                            My Certificates
                        </button>

                        <button
                            onClick={() => setActiveTab("alerts")}
                            className={`py-3 px-6 font-semibold text-sm transition-colors duration-200 ${activeTab === "alerts" ? "border-b-4 border-red-600 text-red-700 bg-gray-50 rounded-t-lg" : "text-gray-500 hover:text-red-600"}`}
                        >
                            Alerts
                            {certs.filter((r) => daysRemaining(r.valid_until) <= 30 && r.is_active).length > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                    {certs.filter((r) => daysRemaining(r.valid_until) <= 30 && r.is_active).length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {/* Removed max-w-6xl from main to allow full-width expansion of two-column grid items */}
            <main className="max-w-7xl mx-auto mt-8 px-4 pb-12">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200">
                    {loading && <p className="text-center text-blue-600 font-medium py-10">Loading Certificates...</p>}
                    {error && <p className="text-red-700 bg-red-100 border-l-4 border-red-500 p-4 rounded-md mb-6 font-medium">Error: {error}</p>}

                    {!loading && !error && (
                        <>
                            {/* Content Header based on active tab */}
                            {activeTab === "certs" && (
                                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Root & Intermediate Certificate Authorities</h2>
                            )}
                            {activeTab === "alerts" && (
                                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Certificate Expiration Alerts</h2>
                            )}
                            <hr className="mb-6" />

                            {/* Content */}
                            {activeTab === "certs" && (
                                <>
                                    {certs.length > 0 ? renderCertCards(certs) : <p className="text-gray-600 text-center py-10">No certificates found for this organization ID.</p>}
                                </>
                            )}

                            {activeTab === "alerts" && (
                                <>
                                    {renderAlerts()}
                                </>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}