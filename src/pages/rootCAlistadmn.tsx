import React, { useEffect, useState } from "react";
import axios from "axios";
//import Userdashboard from "./UserDashboard";
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
    const [activeTab, setActiveTab] = useState<"dashboard" | "certs" | "alerts">(
        "dashboard"
    );
    const [certs, setCerts] = useState<Certificate[]>([]);
    const [intermediates, setIntermediates] = useState<
        Record<string, IntermediateCA[]>
    >({});
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set()); // root CA expanded set
    const [expandedIntermediates, setExpandedIntermediates] = useState<
        Set<string>
    >(new Set()); // intermediate expanded set
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingIntermediates, setLoadingIntermediates] = useState<
        Record<string, boolean>
    >({});
    const [loadingIssued, setLoadingIssued] = useState<Record<string, boolean>>(
        {}
    );
    const [error, setError] = useState<string | null>(null);
    // const [orgId, setOrgId] = useState<string>(
    //     () => localStorage.getItem("orgId") || "1"
    // );
    const [orgId, setOrgId] = useState("");
    // Fetch root CAs (certs)
    const fetchCerts = async (): Promise<void> => {
        if (!orgId?.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get<Certificate[]>(
                `https://pre-prod.be.anchorvpn.net/api/v1/organizations/${orgId}/root-ca/`
            );
            setCerts(res.data || []);
        } catch (err: any) {
            console.error("fetchCerts error", err);
            setError(err?.response?.data?.detail || err?.message || "Failed");
            setCerts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Default behavior: load dashboard counts or certs depending on activeTab.
        if (activeTab === "certs" || activeTab === "alerts") {
            fetchCerts();
        }
        // NOTE: dashboard may call a different aggregator if you want
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
                `https://pre-prod.be.anchorvpn.net/api/v1/root-ca/${rootCaId}/intermediate-ca/`
            );
            const ints: IntermediateCA[] = res.data || [];

            // 2) for each intermediate fetch its issued certificates (in parallel)
            const issuedPromises = ints.map(async (int) => {
                try {
                    const r = await axios.get<Certificate[]>(
                        `https://pre-prod.be.anchorvpn.net/api/v1/intermediate-ca/${int.id}/certificates/`
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
            setIntermediates((prev) => ({ ...prev, [rootCaId]: [] }));
        } finally {
            setLoadingIntermediates((p) => ({ ...p, [rootCaId]: false }));
        }
    };

    // Toggle root row expansion. If expanding and we haven't fetched intermediates, fetch them.
    const toggleRow = (rootCaId: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(rootCaId)) {
                next.delete(rootCaId);
            } else {
                next.add(rootCaId);
                if (!intermediates[rootCaId]) {
                    // fetch intermediates (also fetch issued certs)
                    fetchIntermediates(rootCaId);
                }
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

    // Cards renderer (horizontal layout)
    // Cards renderer (uses existing state variables, so defined inside component)
    const renderCertCards = (data: Certificate[]) => {
        return (
            <div className="flex flex-col gap-6 mt-6">
                {data.map((rootCa) => {
                    const remaining = daysRemaining(rootCa.valid_until);
                    const isExpanded = expandedRows.has(rootCa.id);
                    const intermediateList = intermediates[rootCa.id];

                    return (
                        <div
                            key={rootCa.id}
                            className="bg-white border border-gray-200 rounded-lg shadow-sm p-5"
                        >
                            {/* Root CA Header */}
                            <div className="flex justify-between items-center">
                                <div className="flex flex-wrap items-center gap-x-6 text-sm text-gray-700">
                                    <span className="font-semibold text-blue-700">
                                        ID: {rootCa.id}
                                    </span>
                                    <span>Serial: {rootCa.serial_number}</span>
                                    <span>Common Name: {rootCa.common_name}</span>
                                    <span
                                        className={`font-medium ${remaining < 10
                                            ? "text-red-600"
                                            : remaining < 30
                                                ? "text-yellow-600"
                                                : "text-green-600"
                                            }`}
                                    >
                                        {remaining} days left — {rootCa.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <button
                                    onClick={() => toggleRow(rootCa.id)}
                                    className="text-blue-600 hover:text-blue-800 font-bold"
                                    aria-label={isExpanded ? "Collapse" : "Expand"}
                                >
                                    {isExpanded ? "▲" : "▼"}
                                </button>
                            </div>

                            {/* Intermediate CAs */}
                            {isExpanded && (
                                <div className="mt-3 border-t border-gray-100 pt-3">
                                    {loadingIntermediates[rootCa.id] ? (
                                        <p className="text-gray-500 text-sm">Loading intermediates...</p>
                                    ) : intermediateList && intermediateList.length > 0 ? (
                                        <div className="space-y-3">
                                            {intermediateList.map((int) => {
                                                const intRemaining = daysRemaining(int.valid_until);
                                                const isIntExpanded = expandedIntermediates.has(int.id);
                                                return (
                                                    <div
                                                        key={int.id}
                                                        className="border border-gray-100 rounded-lg p-3 bg-gray-50"
                                                    >
                                                        {/* Intermediate Row */}
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex flex-wrap items-center gap-x-6 text-sm text-gray-700">
                                                                <span className="font-semibold">
                                                                    ID: {int.id}
                                                                </span>
                                                                <span>Serial: {int.serial_number}</span>
                                                                <span>Common Name: {int.common_name}</span>
                                                                <span
                                                                    className={`font-medium ${intRemaining < 10
                                                                        ? "text-red-600"
                                                                        : intRemaining < 30
                                                                            ? "text-yellow-600"
                                                                            : "text-green-600"
                                                                        }`}
                                                                >
                                                                    {intRemaining} days left — {int.is_active ? "Active" : "Expired"}
                                                                </span>
                                                            </div>

                                                            <button
                                                                onClick={() => toggleIntermediate(int.id)}
                                                                className="text-blue-600 hover:text-blue-800 font-semibold"
                                                                aria-label={isIntExpanded ? "Collapse intermediate" : "Expand intermediate"}
                                                            >
                                                                {isIntExpanded ? "▲" : "▼"}
                                                            </button>
                                                        </div>

                                                        {/* Issued Certificates for Intermediate */}
                                                        {isIntExpanded && (
                                                            <div className="mt-2 pl-3 border-l-2 border-gray-200">
                                                                {int.issued_certificates && int.issued_certificates.length > 0 ? (
                                                                    <ul className="space-y-2 text-sm text-gray-700">
                                                                        {int.issued_certificates.map((leaf) => {
                                                                            const leafDays = daysRemaining(leaf.valid_until);
                                                                            return (
                                                                                <li
                                                                                    key={leaf.id}
                                                                                    className="border-b border-gray-100 pb-2"
                                                                                >
                                                                                    <div className="flex justify-between items-center flex-wrap gap-x-6">
                                                                                        <span className="font-semibold">
                                                                                            ID: {leaf.id}
                                                                                        </span>
                                                                                        <span>Serial: {leaf.serial_number}</span>
                                                                                        <span>Common Name: {leaf.common_name}</span>
                                                                                        <span className={`font-medium ${leafDays < 10
                                                                                            ? "text-red-600"
                                                                                            : leafDays < 30
                                                                                                ? "text-yellow-600"
                                                                                                : "text-green-600"
                                                                                            }`}>
                                                                                            {leafDays} days left — {leaf.is_active ? "Active" : "Expired"}
                                                                                        </span>
                                                                                    </div>
                                                                                </li>
                                                                            );
                                                                        })}
                                                                    </ul>
                                                                ) : (
                                                                    <p className="text-xs italic text-gray-500">
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
                                        <p className="text-sm text-gray-400 italic">
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
            (r) => daysRemaining(r.valid_until) <= 10 && r.is_active
        );
        return (
            <div className="space-y-3">
                {expiring.length === 0 ? (
                    <p className="text-gray-600">No certificates expiring soon.</p>
                ) : (
                    expiring.map((c) => (
                        <div key={c.id} className="p-3 bg-white border rounded">
                            <div className="flex justify-between">
                                <div>
                                    <div className="font-medium">{c.common_name}</div>
                                    <div className="text-xs text-gray-500">ID: {c.id}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-red-600">{daysRemaining(c.valid_until)} days</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-blue-100 text-blue-800 py-10 px-8 shadow-sm border-b border-blue-200 text-center">
                <h1 className="text-3xl font-bold">GoSecure - AnchorVPN</h1>
                <p className="text-blue-700 font-bold text-lg mt-2">User Certificate Management</p>
            </header>

            {/* Organisation Input + Tabs */}
            <div className="border-b border-gray-200 bg-white">
                <div className="px-8 py-4 flex flex-col" style={{ marginLeft: "25%" }}>
                    <div className="flex items-center space-x-3 mb-4">
                        <label className="text-gray-700 font-semibold">Organization ID:</label>
                        <input
                            type="text"
                            value={orgId}
                            onChange={(e) => setOrgId(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-1 w-40 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>



                    <div className="flex space-x-6">
                        {/* <button
                            onClick={() => setActiveTab("dashboard")}
                            className={`py-3 px-4 font-medium ${activeTab === "dashboard" ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500 hover:text-blue-600"}`}
                        >
                            Dashboard
                        </button> */}
                        <button
                            onClick={() => setActiveTab("certs")}
                            className={`py-3 px-4 font-medium ${activeTab === "certs" ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500 hover:text-blue-600"}`}
                        >
                            My Certificates
                        </button>

                        <button
                            onClick={() => setActiveTab("alerts")}
                            className={`py-3 px-4 font-medium ${activeTab === "alerts" ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500 hover:text-blue-600"}`}
                        >
                            Alerts
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto mt-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                {loading && <p className="text-center text-gray-600">Loading...</p>}
                {error && <p className="text-red-600 bg-red-50 p-2 rounded mb-4 text-center">Error: {error}</p>}

                {!loading && !error && (
                    <>

                        {activeTab === "certs" && (
                            <>
                                <h2 className="text-2xl font-semibold mb-4 text-blue-700 text-center">My Certificates</h2>
                                {certs.length > 0 ? renderCertCards(certs) : <p className="text-gray-600 text-center">No certificates found for your account.</p>}
                            </>
                        )}

                        {activeTab === "alerts" && (
                            <>
                                <h2 className="text-2xl font-semibold mb-4 text-red-400 text-center">Certificates Expiring Soon</h2>
                                {renderAlerts()}
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
