import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
const API_BASE_URL = "https://pre-prod.be.anchorvpn.net/api/v1"; // adjust if needed

// ------------------ INTERFACES ------------------
export interface LeafCertificate {
    id: number;
    intermediate_ca_id: number;
    common_name: string;
    certificate_type: string;   // "server" | "user" | etc.
    key_length: number;
    valid_from: string;         // ISO datetime
    valid_until: string;        // ISO datetime
    serial_number: string;
    is_active: boolean;
    created_at: string;         // ISO datetime
}

export interface IntermediateCertificate {
    id: number;
    root_ca_id: number;
    common_name: string;
    key_length: number;
    valid_from: string;       // ISO datetime
    valid_until: string;      // ISO datetime
    serial_number: string;
    is_active: boolean;
    created_at: string;       // ISO datetime

    issued_certificates?: LeafCertificate[];
}

export interface RootCertificate {
    id: number;
    organization_id: number;
    common_name: string;
    key_length: number;
    valid_from: string;      // ISO datetime
    valid_until: string;     // ISO datetime
    serial_number: string;
    is_active: boolean;
    created_at: string;      // ISO datetime
    intermediates?: IntermediateCertificate[];
}


export default function UserCertManager() {
    // raw fetched data (full tree)
    const [roots, setRoots] = useState<any[]>([]);
    const [interByRoot, setInterByRoot] = useState<Record<string, any[]>>({});
    const [certsByIntermediate, setCertsByIntermediate] = useState<Record<string, any[]>>({});

    // UI-visible filtered data (what renderCertCards/renderAlerts expect)
    const [certs, setCerts] = useState<any[]>([]); // filtered roots
    const [intermediates, setIntermediates] = useState<Record<string, any[]>>({}); // rootId -> intermediates (each with issued_certificates)

    // inputs / dropdowns
    const [orgId, setOrgId] = useState("");
    const [rootIdInput, setRootIdInput] = useState(""); // acts as root filter + trigger for dropdown population
    const [intermediateIdInput, setIntermediateIdInput] = useState("");
    const [certIdInput, setCertIdInput] = useState("");

    const [intermediateOptions, setIntermediateOptions] = useState<any[]>([]);
    const [certOptions, setCertOptions] = useState<any[]>([]);

    // simple UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // helper: safe id -> normalized string
    const toId = (v: any) => (v === null || v === undefined ? "" : String(v).trim());
    const [activeTab, setActiveTab] = useState("certs");
    const [certIdToDownload, setCertIdToDownload] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [downloadMessage, setDownloadMessage] = useState("");
    const [certTypeToDownload, setCertTypeToDownload] = useState("");

    const [expandedRoot, setExpandedRoot] = useState({});
    const [expandedInter, setExpandedInter] = useState({});

    const toggleRoot = (id: number) => {
        setExpandedRoot(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleInter = (id: number) => {
        setExpandedInter(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString();

    const renderExpandableTable = () => {
        if (certs.length === 0) return <div>No certificates found</div>;

        return (
            <table className="w-full border border-gray-300 border-collapse">
                <thead className="bg-[#1e28b6] text-white text-lg">
                    <tr>
                        <th className="border px-4 py-3 w-1/3">Root Certificates</th>
                        <th className="border px-4 py-3 w-1/3">Intermediate Certificates</th>
                        <th className="border px-4 py-3 w-1/3">Issued Certificates</th>
                    </tr>
                </thead>

                <tbody>
                    {certs.map((root) => {
                        const rootIntermediates = intermediates[root.id] || [];
                        const interCount = rootIntermediates.length;

                        const rem = daysRemaining(root.valid_until);
                        const status = getStatusStyles(root.is_active, rem);

                        return (
                            <>
                                {/* ROOT ROW */}
                                <tr
                                    key={root.id}
                                    className="cursor-pointer bg-gray-100 hover:bg-gray-200"
                                    onClick={() => toggleRoot(root.id)}
                                >
                                    <td className="border px-4 py-4 align-top">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${status.className}`}>
                                            {status.text}
                                        </div>

                                        <div className="mt-2 text-xl font-bold text-blue-900">{root.common_name}</div>
                                        <div className="text-gray-700 text-xl font-bold">ID: {root.id}</div>
                                        <div className="text-gray-700 text-xl">Key: {root.key_length} bits</div>

                                        <div className={`mt-2 text-xl font-semibold ${rem <= 30 ? "text-red-600" : "text-green-700"}`}>
                                            Expires: {formatDate(root.valid_until)}
                                        </div>

                                        <div className="text-blue-800 mt-1 text-xl font-bold flex items-center gap-2">
                                            <span>Intermediates: {interCount}</span>
                                            <span>{expandedRoot[root.id] ? "▼" : "►"}</span>
                                        </div>
                                    </td>

                                    <td className="border"></td>
                                    <td className="border"></td>
                                </tr>

                                {/* INTERMEDIATES */}
                                {expandedRoot[root.id] &&
                                    rootIntermediates.map((int) => {
                                        const leafCerts = int.issued_certificates || [];
                                        const leafCount = leafCerts.length;

                                        const remI = daysRemaining(int.valid_until);
                                        const statusI = getStatusStyles(int.is_active, remI);

                                        return (
                                            <>
                                                <tr
                                                    key={int.id}
                                                    className="cursor-pointer bg-gray-50 hover:bg-gray-100"
                                                    onClick={() => toggleInter(int.id)}
                                                >
                                                    <td className="border"></td>

                                                    <td className="border px-4 py-4 align-top">
                                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusI.className}`}>
                                                            {statusI.text}
                                                        </div>

                                                        <div className="mt-2 text-xl font-bold text-blue-800">{int.common_name}</div>
                                                        <div className="text-xl text-gray-700 font-bold">ID: {int.id}</div>
                                                        <div className="text-xl text-gray-700">Key: {int.key_length} bits</div>

                                                        <div className={`mt-2 text-xl font-semibold ${remI <= 30 ? "text-red-600" : "text-green-700"}`}>
                                                            Expires: {formatDate(int.valid_until)}
                                                        </div>

                                                        <div className="text-blue-700 mt-1 text-xl font-bold flex items-center gap-2">
                                                            <span>Certificates: {leafCount}</span>
                                                            <span>{expandedInter[int.id] ? "▼" : "►"}</span>
                                                        </div>
                                                    </td>

                                                    <td className="border"></td>
                                                </tr>

                                                {/* LEAF CERTIFICATES */}
                                                {expandedInter[int.id] &&
                                                    leafCerts.map((leaf) => {
                                                        const remL = daysRemaining(leaf.valid_until);
                                                        const statusL = getStatusStyles(leaf.is_active, remL);

                                                        return (
                                                            <tr key={leaf.id} className="bg-white">
                                                                <td className="border"></td>
                                                                <td className="border"></td>

                                                                <td className="border px-4 py-4 align-top">
                                                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusL.className}`}>
                                                                        {statusL.text}
                                                                    </div>

                                                                    <div className="mt-2 text-xl font-bold text-blue-900">
                                                                        {leaf.common_name}
                                                                    </div>

                                                                    <div className="text-xl text-gray-700 font-bold">ID: {leaf.id}</div>
                                                                    <div className="text-xl text-gray-700">Key: {leaf.key_length} bits</div>

                                                                    <div className={`mt-2 text-xl font-semibold ${remL <= 30 ? "text-red-600" : "text-green-700"}`}>
                                                                        Expires: {formatDate(leaf.valid_until)}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </>
                                        );
                                    })}
                            </>
                        );
                    })}
                </tbody>
            </table>
        );
    };


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





    // Fetch entire tree when orgId changes
    useEffect(() => {
        let cancelled = false;

        const fetchCerts = async () => {
            if (!orgId?.trim()) {
                setRoots([]);
                setInterByRoot({});
                setCertsByIntermediate({});
                setCerts([]);
                setIntermediates({});
                setIntermediateOptions([]);
                setCertOptions([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const resRoot = await axios.get(`${API_BASE_URL}/organizations/${orgId}/root-ca/`);
                const rootList = Array.isArray(resRoot.data) ? resRoot.data : [];

                const newInterByRoot: Record<string, any[]> = {};
                const newCertsByIntermediate: Record<string, any[]> = {};

                // fetch intermediates and certs
                await Promise.all(rootList.map(async (root: any) => {
                    if (cancelled) return;
                    const rootKey = toId(root?.id);

                    try {
                        const resInter = await axios.get(`${API_BASE_URL}/root-ca/${rootKey}/intermediate-ca/`);
                        const interList = Array.isArray(resInter.data) ? resInter.data : [];
                        newInterByRoot[rootKey] = interList;

                        // Fetch certificates for each intermediate
                        await Promise.all(interList.map(async (inter: any) => {
                            const interKey = toId(inter?.id);
                            try {
                                const resCerts = await axios.get(`${API_BASE_URL}/intermediate-ca/${interKey}/certificates/`);
                                newCertsByIntermediate[interKey] = Array.isArray(resCerts.data) ? resCerts.data : [];
                            } catch {
                                newCertsByIntermediate[interKey] = [];
                            }
                        }));
                    } catch {
                        newInterByRoot[rootKey] = [];
                    }
                }));

                if (cancelled) return;

                // store raw tree
                setRoots(rootList);
                setInterByRoot(newInterByRoot);
                setCertsByIntermediate(newCertsByIntermediate);

                // apply no-filter default (show all)
                applyFilters(rootList, newInterByRoot, newCertsByIntermediate, "", "", "");
            } catch (err) {
                console.error("fetchCerts", err);
                setError("Failed to load certificate tree for this Org ID.");
                setRoots([]);
                setInterByRoot({});
                setCertsByIntermediate({});
                setCerts([]);
                setIntermediates({});
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchCerts();

        return () => { cancelled = true; };
    }, [orgId]);

    // applyFilters: produces certs + intermediates states (UI-ready)
    // accepts optional params so callers can pass freshly fetched data
    const applyFilters = (
        rootsBase = roots,
        interBase = interByRoot,
        certsBase = certsByIntermediate,
        rootFilter = rootIdInput,
        interFilter = intermediateIdInput,
        certFilter = certIdInput
    ) => {
        const rf = toId(rootFilter).toLowerCase();
        const ifl = toId(interFilter).toLowerCase();
        const cf = toId(certFilter).toLowerCase();

        // start with roots (array of objects)
        let filteredRoots = Array.isArray(rootsBase) ? rootsBase.slice() : [];

        if (rf) {
            filteredRoots = filteredRoots.filter(r => toId(r?.id).toLowerCase().includes(rf));
        }

        const finalInter: Record<string, any[]> = {};

        filteredRoots.forEach(root => {
            const rootKey = toId(root?.id);
            let interList = Array.isArray(interBase[rootKey]) ? interBase[rootKey].slice() : [];

            if (ifl) {
                interList = interList.filter(i => toId(i?.id).toLowerCase().includes(ifl));
            }

            const mappedInter = interList.map(inter => {
                const interKey = toId(inter?.id);
                let certList = Array.isArray(certsBase[interKey]) ? certsBase[interKey].slice() : [];

                if (cf) {
                    certList = certList.filter(c => toId(c?.id).toLowerCase().includes(cf));
                }

                // attach issued_certificates so render functions expecting that shape work
                return {
                    ...inter,
                    issued_certificates: certList
                };
            }).filter(i => i.issued_certificates.length > 0 || !cf); // if certFilter exists then drop intermediates with 0 certs

            finalInter[rootKey] = mappedInter;
        });

        // Drop roots with zero intermediates (if intermediate filtering or cert filtering active)
        if (ifl || cf) {
            filteredRoots = filteredRoots.filter(r => Array.isArray(finalInter[toId(r.id)]) && finalInter[toId(r.id)].length > 0);
        }

        // set UI states expected by rest of app
        setCerts(filteredRoots);
        setIntermediates(finalInter);
    };

    // when any of the filter inputs change, apply filters
    useEffect(() => {
        applyFilters();
    }, [rootIdInput, intermediateIdInput, certIdInput, roots, interByRoot, certsByIntermediate]);

    // When rootIdInput changes: populate intermediateOptions dropdown (all intermediates for that root)
    useEffect(() => {
        const rid = toId(rootIdInput);
        if (!rid) {
            setIntermediateOptions([]);
            setIntermediateIdInput("");
            setCertOptions([]);
            setCertIdInput("");
            return;
        }

        // find root object (allow numeric/string mismatch)
        const matchedRoot = roots.find(r => toId(r?.id) === rid);

        // gather intermediates from map or by scanning (defensive)
        let matchedIntermediates: any[] = [];

        if (matchedRoot) {
            const listFromMap = interByRoot[toId(matchedRoot.id)] ?? [];
            if (Array.isArray(listFromMap) && listFromMap.length > 0) {
                matchedIntermediates = listFromMap;
            } else {
                matchedIntermediates = Object.values(interByRoot).flat().filter(i => toId(i?.parent_id) === toId(matchedRoot.id));
            }
        } else {
            // If matchedRoot not found, try direct map key (maybe user entered id matching map key)
            const directList = interByRoot[rid] ?? [];
            if (Array.isArray(directList) && directList.length > 0) {
                matchedIntermediates = directList;
            }
        }

        // normalize to array
        if (!Array.isArray(matchedIntermediates)) matchedIntermediates = [];

        // set options (do NOT auto-select)
        setIntermediateOptions(matchedIntermediates);
        setIntermediateIdInput("");   // important: leave empty so user chooses
        setCertOptions([]);
        setCertIdInput("");
    }, [rootIdInput, roots, interByRoot]);

    // when intermediateIdInput changes: populate certOptions dropdown
    useEffect(() => {
        const iid = toId(intermediateIdInput);

        if (!iid) {
            setCertOptions([]);
            setCertIdInput("");   // empty until user selects
            return;
        }

        // Try map lookup first
        let certList = certsByIntermediate[iid] ?? [];

        // fallback: scan all
        if (!Array.isArray(certList) || certList.length === 0) {
            certList = Object.values(certsByIntermediate)
                .flat()
                .filter(c => toId(c?.parent_id) === iid);
        }

        setCertOptions(certList ?? []);

        // IMPORTANT: do NOT auto-select anything
        setCertIdInput("");
    }, [intermediateIdInput, certsByIntermediate]);


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

    /////Main RETURN////
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

            {/* Organization + Filters Section */}


            <div className="flex justify-center mt-10">
                <div className="w-3/4 min-w-[75%]">
                    <label className="text-2xl font-bold text-blue-700 mb-3 block text-center">Organization ID</label>
                    <input
                        type="text"
                        placeholder="Enter Org ID"
                        value={orgId}
                        onChange={(e) => setOrgId(e.target.value)}
                        className="text-center border border-gray-300 rounded-lg px-4 py-2.5 w-full text-lg font-bold focus:ring-2 focus:ring-blue-500 shadow-sm mb-6"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-lg">

                        {/* Root ID */}
                        <div className="flex flex-col">
                            <label className="font-semibold text-center  text-gray-700 mb-1">Root Certs</label>
                            <input
                                placeholder="Enter / Filter Root CA ID"
                                value={rootIdInput}
                                onChange={(e) => setRootIdInput(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-center shadow-sm text-lg"
                            />
                        </div>

                        {/* Intermediate ID */}
                        <div className="flex flex-col">
                            <label className="font-semibold text-center text-gray-700 mb-1">Intermediate Certs</label>
                            <select
                                value={intermediateIdInput}
                                onChange={(e) => setIntermediateIdInput(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-center shadow-sm text-lg"
                            >
                                <option value="">
                                    {intermediateOptions.length > 0
                                        ? `Intermediates (${intermediateOptions.length})`
                                        : "No intermediates"}
                                </option>

                                {intermediateOptions.map(i => (
                                    <option key={toId(i.id)} value={toId(i.id)}>
                                        {i.id} — {i.common_name ?? ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Certificate ID */}
                        <div className="flex flex-col">
                            <label className="font-semibold text-center text-gray-700 mb-1">Certificates</label>
                            <select
                                value={certIdInput}
                                onChange={(e) => setCertIdInput(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-center shadow-sm text-lg"
                            >
                                <option value="">
                                    {certOptions.length > 0
                                        ? `Certificates (${certOptions.length})`
                                        : "No certificates"}
                                </option>

                                {certOptions.map(c => (
                                    <option key={toId(c.id)} value={toId(c.id)}>
                                        {c.id} — {c.common_name ?? ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Button */}
                        <div className="flex flex-col">
                            <button
                                onClick={() => {
                                    setRootIdInput("");
                                    setIntermediateIdInput("");
                                    setCertIdInput("");
                                    setIntermediateOptions([]);
                                    setCertOptions([]);
                                    applyFilters(roots, interByRoot, certsByIntermediate, "", "", "");
                                }}
                                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-semibold text-gray-700 text-lg"
                            >
                                Clear Filters
                            </button>
                        </div>

                    </div>
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
                    {activeTab === "certs" && renderExpandableTable()}
                    {activeTab === "alerts" && renderAlerts({ certs, intermediates })}
                    {activeTab === "download" && renderDownloadTab()}
                    {activeTab === "help" && renderHelp()}
                </main>

                {/* Footer */}
                <footer className="text-center py-4 text-gray-500 text-sm border-t">
                    © GoSecure 2025
                </footer>
            </div>

            {/* <div className="bg-gray-100 min-h-screen flex flex-col rounded-t-2xl shadow-inner mt-6 p-6">
                {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : renderCertCardsWrapper()}
            </div> */}
        </div>


    );
}
