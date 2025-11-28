import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { rootCAmockdata, intermediatemockdata, issuedcertsmockdata, usercertsmockdata, servercertsmockdata } from "./AdmnCertmanagerMockdata"
import { token } from "@/components/token"
import { renderHelp } from "@/components/Usercertmanager/Help";
import { renderUserTable } from "@/components/Usercertmanager/usercerts";
import { useTheme } from "@/context/ThemeContext";
import ThemeSelector from "@/context/ThemeSelector";
//import { fetchallcerts, renderRootallTable, renderIntermediateallTable, renderIssuedCertsallTable } from "@/components/Allcerts.jsx";
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

export interface ServerCertificate {
    id: number;
    intermediate_ca_id: number;
    common_name: string;
    certificate_type: string;
    key_length: number;
    valid_from: string;
    valid_until: string;
    serial_number: string;
    is_active: boolean;
    created_at: string;
}

export interface UserCertificate {
    id: number;
    intermediate_ca_id: number;
    common_name: string;
    certificate_type: string;
    key_length: number;
    valid_from: string;
    valid_until: string;
    serial_number: string;
    is_active: boolean;
    created_at: string;
}
type ExpandState = Record<string, boolean>;

interface OrgCertificate {
    id: string;
    common_name: string;
    key_length: number;
    valid_until: string;
    is_active: boolean;
    intermediate_ca_id?: string | null;
}
export default function UserCertManager() {
    // raw fetched data (full tree)
    const [roots, setRoots] = useState<any[]>([]);
    const [interByRoot, setInterByRoot] = useState<Record<string, any[]>>({});
    const [certsByIntermediate, setCertsByIntermediate] = useState<Record<string, any[]>>({});

    // UI-visible filtered data (what renderexpandable/renderAlerts expect)
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
    const [servercerts, setServercerts] = useState<ServerCertificate[]>([]);
    const [loadingServers, setLoadingServers] = useState(false);
    const [serverError, setServerError] = useState("");
    const [usercerts, setUsercerts] = useState<UserCertificate[]>([]);
    const [loadingUser, setLoadingUser] = useState(false);
    const [errorUser, setErrorUser] = useState("");

    const [expandedRoot, setExpandedRoot] = useState<ExpandState>({});
    const [expandedInter, setExpandedInter] = useState<ExpandState>({});

    const [rootallcerts, setRootallcerts] = useState<RootCertificate[]>([]);
    const [intermediateallcerts, setIntermediateallcerts] = useState<IntermediateCertificate[]>([]);
    const [issuedallcerts, setIssuedallcerts] = useState<LeafCertificate[]>([]);
    const [allcertSubTab, setAllcertSubTab] = useState<
        "intermediate" | "issued" | "root"
    >("intermediate");
    const [certsSubTab, setCertsSubTab] = useState("hierarchy");

    // const [hierarchySubTab, setHierarchySubTab] = useState("hierarchy");
    // const [issuedSubTab, setIssuedSubTab] = useState("issued");
    // const [alertsSubTab, setAlertsSubTab] = useState("alerts");
    const [orgIdCerts, setOrgIdCerts] = useState<OrgCertificate[]>([]);
    const [loadingOrgIdCerts, setLoadingOrgIdCerts] = useState(false);
    const [orgIdError, setOrgIdError] = useState<string | null>(null);

    // ------------------ HELPERS ------------------
    const toggleRoot = (id: string) => {
        setExpandedRoot(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const toggleInter = (id: string) => {
        setExpandedInter(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString();

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



    // Fetch Certs--Entire Hierarchy when orgId changes
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

    ////Hierarchy Table
    const renderExpandableTable = () => {
        if (certs.length === 0)
            return (
                <div className="text-center text-gray-600 text-xl mt-4">
                    No certificates found
                </div>
            );

        return (
            <div className="space-y-6 w-[90%] mx-auto">

                {/* ROOT CERTS HEADING */}
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">

                    Root Certificates
                </h2>

                {certs.map((root) => {
                    const rootIntermediates = intermediates[root.id] || [];
                    const interCount = rootIntermediates.length;

                    const rem = daysRemaining(root.valid_until);
                    const status = getStatusStyles(root.is_active, rem);

                    return (
                        <div key={root.id} className="border rounded-xl shadow-sm bg-white">

                            {/* ROOT CARD */}
                            <div
                                className="p-6 cursor-pointer bg-blue-50 hover:bg-blue-100 flex justify-between items-center border-b border-blue-200"

                                onClick={() => toggleRoot(root.id)}
                            >
                                <div className="flex items-center gap-12 text-2xl">

                                    <span className={`px-4 py-1 rounded-full font-semibold text-xl ${status.className}`}>
                                        {status.text}
                                    </span>

                                    <span className="font-bold text-blue-900 text-3xl">
                                        {root.common_name}
                                    </span>

                                    <span className="font-bold text-gray-800 text-xl">
                                        ID: {root.id}
                                    </span>

                                    <span className="text-gray-700 text-xl">
                                        {root.key_length} bits
                                    </span>

                                    <span className={`font-semibold text-xl ${rem <= 30 ? "text-red-600" : "text-green-700"}`}>
                                        Expires: {formatDate(root.valid_until)}
                                    </span>

                                    <span className="font-bold text-blue-700 text-xl">
                                        Intermediates: {interCount}
                                    </span>

                                </div>

                                <div className="text-5xl text-gray-700">
                                    {expandedRoot[root.id] ? "−" : "+"}
                                </div>
                            </div>

                            {/* INTERMEDIATES SECTION */}
                            {expandedRoot[root.id] && (
                                <div className="p-6 space-y-5 border-t">

                                    {interCount > 0 ? (
                                        <>
                                            {/* INTERMEDIATE HEAD */}
                                            <h3 className="pl-40 text-2xl font-extrabold text-gray-700 ml-4">
                                                Intermediate Certificates
                                            </h3>

                                            {/* MAP INTERMEDIATES HERE */}
                                            {rootIntermediates.map((int) => {
                                                const remI = daysRemaining(int.valid_until);
                                                const statusI = getStatusStyles(int.is_active, remI);
                                                const leafCerts = int.issued_certificates || [];

                                                return (
                                                    <div key={int.id} className="bg-gray-50 rounded-xl border">

                                                        {/* INTERMEDIATE CARD */}
                                                        <div
                                                            className="p-5 pl-30 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                                                            onClick={() => toggleInter(int.id)}
                                                        >
                                                            <div className="flex items-center gap-12 text-xl ml-8">

                                                                <span className={`px-4 py-1 rounded-full font-semibold text-lg ${statusI.className}`}>
                                                                    {statusI.text}
                                                                </span>

                                                                <span className="font-bold text-blue-800 text-3xl">
                                                                    {int.common_name}
                                                                </span>

                                                                <span className="font-bold text-gray-800 text-xl">
                                                                    ID: {int.id}
                                                                </span>

                                                                <span className="text-gray-700 text-xl">
                                                                    {int.key_length} bits
                                                                </span>

                                                                <span className={`font-semibold text-xl ${remI <= 30 ? "text-red-600" : "text-green-700"}`}>
                                                                    Expires: {formatDate(int.valid_until)}
                                                                </span>

                                                                <span className="font-bold text-blue-700 text-xl">
                                                                    Certificates: {leafCerts.length}
                                                                </span>

                                                            </div>

                                                            <div className="text-5xl text-gray-700">
                                                                {expandedInter[int.id] ? "−" : "+"}
                                                            </div>
                                                        </div>

                                                        {/* LEAF CERTIFICATES SECTION */}
                                                        {expandedInter[int.id] && (
                                                            <div className="p-5 pl-60 space-y-4 border-t">

                                                                {leafCerts.length > 0 ? (
                                                                    <>
                                                                        <h4 className="pl-60 text-xl font-bold text-gray-600 ml-12">
                                                                            Issued Certificates
                                                                        </h4>

                                                                        <table className="ml-20 w-[90%] text-left border-collapse">
                                                                            <thead>
                                                                                <tr className="border-b text-lg font-semibold text-gray-700">
                                                                                    <th className="py-2">Status</th>
                                                                                    <th className="py-2">Common Name</th>
                                                                                    <th className="py-2">ID</th>
                                                                                    <th className="py-2">Key Length</th>
                                                                                    <th className="py-2">Expiry</th>
                                                                                </tr>
                                                                            </thead>

                                                                            <tbody>
                                                                                {leafCerts.map((leaf: LeafCertificate) => {
                                                                                    const remL = daysRemaining(leaf.valid_until);
                                                                                    const statusL = getStatusStyles(leaf.is_active, remL);

                                                                                    return (
                                                                                        <tr key={leaf.id} className="border-b hover:bg-gray-50 text-xl">
                                                                                            <td className="py-3">
                                                                                                <span className={`px-4 py-1 rounded-full ${statusL.className}`}>
                                                                                                    {statusL.text}
                                                                                                </span>
                                                                                            </td>

                                                                                            <td className="py-3 font-bold text-blue-900">{leaf.common_name}</td>
                                                                                            <td className="py-3 font-semibold text-gray-800">{leaf.id}</td>
                                                                                            <td className="py-3 text-gray-700">{leaf.key_length} bits</td>

                                                                                            <td
                                                                                                className={`py-3 font-semibold ${remL <= 30 ? "text-red-600" : "text-green-700"
                                                                                                    }`}
                                                                                            >
                                                                                                {formatDate(leaf.valid_until)}
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                })}
                                                                            </tbody>

                                                                        </table>
                                                                    </>
                                                                ) : (
                                                                    <div className="text-gray-600 text-lg ml-12">
                                                                        No issued certificates available
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}


                                                    </div>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        // NO INTERMEDIATES → ONLY THIS MESSAGE
                                        <div className="text-gray-600 text-xl ml-4">
                                            No intermediate certificates available
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

        let filteredRoots = Array.isArray(rootsBase) ? rootsBase.slice() : [];

        // ROOT EXACT MATCH
        if (rf) {
            filteredRoots = filteredRoots.filter(
                r => toId(r?.id).toLowerCase() === rf
            );
        }

        const finalInter: Record<string, any[]> = {};

        filteredRoots.forEach(root => {
            const rootKey = toId(root?.id);

            let interList = Array.isArray(interBase[rootKey])
                ? interBase[rootKey].slice()
                : [];

            // INTERMEDIATE EXACT MATCH
            if (ifl) {
                interList = interList.filter(
                    i => toId(i?.id).toLowerCase() === ifl
                );
            }

            const mappedInter = interList
                .map(inter => {
                    const interKey = toId(inter?.id);

                    let certList = Array.isArray(certsBase[interKey])
                        ? certsBase[interKey].slice()
                        : [];

                    // CERT EXACT MATCH
                    if (cf) {
                        certList = certList.filter(
                            c => toId(c?.id).toLowerCase() === cf
                        );
                    }

                    return { ...inter, issued_certificates: certList };
                })
                // If cert filter is active, drop intermediates with zero certs
                .filter(i => i.issued_certificates.length > 0 || !cf);

            finalInter[rootKey] = mappedInter;
        });

        // Drop roots that have zero intermediates when filtering
        if (ifl || cf) {
            filteredRoots = filteredRoots.filter(
                r => Array.isArray(finalInter[toId(r.id)]) &&
                    finalInter[toId(r.id)].length > 0
            );
        }

        setCerts(filteredRoots);
        setIntermediates(finalInter);
    };
    ////Filter
    const renderCertFilters = () => (
        <div className="p-6 flex justify-center mt-10">
            <div
                className="
        w-[90%] min-w-[75%]
        shadow-md rounded-xl p-6
        border
        bg-[var(--bg-card)]
        border-[var(--border-color)]
        text-[var(--text-primary)]
    "
            >
                <div className="flex items-center gap-6">

                    <span className="text-2xl font-extrabold text-[var(--text-primary)] whitespace-nowrap">
                        Organization ID
                    </span>

                    <input
                        type="text"
                        placeholder="--Enter Org ID--"
                        value={orgId}
                        onChange={(e) => setOrgId(e.target.value)}
                        className="
        text-2xl font-semibold text-center
        py-2 px-3
        bg-gray-500 text-gray-100
        border border-gray-500
        rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500
        w-[300px]
    "
                    />

                </div>


                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 items-end text-lg">

                    {/* Root ID */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-center mb-1 text-[var(--text-secondary)]">
                            Root Certs
                        </label>

                        <input
                            placeholder="Enter Root CA ID"
                            value={rootIdInput}
                            onChange={(e) => setRootIdInput(e.target.value)}
                            className="
                            border border-[var(--border-color)] rounded-lg px-3 py-2 text-center shadow-sm
                            bg-[var(--bg-primary)] text-[var(--text-primary)]

                            dark:bg-[var(--bg-primary)] 
                            dark:text-[var(--text-primary)]
                            dark:border-[var(--border-color)]
                        "
                        />
                    </div>

                    {/* Intermediate ID */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-center mb-1 text-[var(--text-secondary)]">
                            Intermediate Certs
                        </label>

                        <select
                            value={intermediateIdInput}
                            onChange={(e) => setIntermediateIdInput(e.target.value)}
                            className="
                            border border-[var(--border-color)] rounded-lg px-3 py-2 text-center shadow-sm
                            bg-[var(--bg-primary)] text-[var(--text-primary)]

                            dark:bg-[var(--bg-primary)] 
                            dark:text-[var(--text-primary)]
                            dark:border-[var(--border-color)]
                        "
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

                    {/* Cert ID */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-center mb-1 text-[var(--text-secondary)]">
                            Certificates
                        </label>

                        <select
                            value={certIdInput}
                            onChange={(e) => setCertIdInput(e.target.value)}
                            className="
                            border border-[var(--border-color)] rounded-lg px-3 py-2 text-center shadow-sm
                            bg-[var(--bg-primary)] text-[var(--text-primary)]

                            dark:bg-[var(--bg-primary)] 
                            dark:text-[var(--text-primary)]
                            dark:border-[var(--border-color)]
                        "
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
                            className="
        px-4 py-2 rounded-lg font-semibold text-xl
        bg-gray-600 text-white
        border border-gray-700
        hover:bg-gray-700
                            dark:bg-[var(--bg-primary)]
                            dark:text-[var(--text-primary)]
                            dark:border-[var(--border-color)]
                            dark:hover:bg-[var(--bg-card)]
                        "
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

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



    ///Alerts
    const renderAlerts = (p0: { certs: any[]; intermediates: Record<string, any[]>; }) => {
        const EXPIRY_THRESHOLD = 1500; // show certs expiring in 30 days///////////////////////////////////////

        if (loading)
            return <p className="p-6 mt-4 bg-white rounded-xl shadow-lg">Loading certificates...</p>;

        if (error)
            return <p className="p-6 mt-4 bg-white rounded-xl shadow-lg">{error}</p>;

        if (!certs || certs.length === 0)
            return (
                <p className="p-6 mt-4 bg-white rounded-xl shadow-lg">
                    No certificates found.
                </p>
            );

        return (
            <div className="space-y-6 w-[90%] mx-auto p-6 mt-4 bg-white rounded-xl shadow-lg">
                <h3 className="p-6 mt-4 bg-white rounded-xl shadow-lg text-3xl font-bold mb-8 text-red-700 text-center">
                    Expiring Certificates
                </h3>

                <table className="min-w-full border border-gray-300 rounded-xl shadow bg-white">
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
                                    (leaf: { valid_until: string | number | Date; }) => daysRemaining(leaf.valid_until) <= EXPIRY_THRESHOLD
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
                                                ?.filter((leaf: { valid_until: string | number | Date; }) => daysRemaining(leaf.valid_until) <= EXPIRY_THRESHOLD)
                                                .map((leaf: { id: boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.Key | null | undefined; common_name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; valid_until: string | number | Date; }) => (
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
                                                    (leaf: { valid_until: string | number | Date; }) => daysRemaining(leaf.valid_until) <= EXPIRY_THRESHOLD
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



    //SERVER
    useEffect(() => {
        if (activeTab === "servers") {
            fetchServercerts();
        }
    }, [activeTab]);

    const fetchServercerts = async () => {
        setLoadingServers(true);
        setServerError("");
        console.log('ssssssssssssssservers', servercerts)

        try {
            const res = await axios.get(`${API_BASE_URL}/certificates/server/`);
            setServercerts(res.data || []);
            console.log("API RESPONSE:", res.data);
            // const serverRes = servercertsmockdata;   // mock array
            // setServercerts(serverRes);

        } catch (err) {
            console.error("Fetch servers error:", err);
            setServerError("Failed to fetch server certificates");
        } finally {
            setLoadingServers(false);
        }
    };
    console.log('ssssssssssssssservers', servercerts)
    const renderServerCertsTable = () => (
        <table className="w-[75%] mx-auto border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">Common Name</th>
                    <th className="px-4 py-2 border">Intermediate CA</th>
                    <th className="px-4 py-2 border">Valid Until</th>
                    {/* <th className="px-4 py-2 border">Actions</th> */}
                </tr>
            </thead>

            <tbody>
                {servercerts.map((cert) => {
                    const days = daysRemaining(cert.valid_until);
                    const status = getStatusStyles(cert.is_active, days);

                    return (
                        <tr key={cert.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border">
                                <span className={"px-2 py-1 rounded text-sm " + status.className}>
                                    {status.text}
                                </span>
                            </td>

                            <td className="px-4 py-2 border">{cert.id}</td>

                            <td className="px-4 py-2 border">{cert.common_name}</td>

                            <td className="px-4 py-2 border">{cert.intermediate_ca_id}</td>

                            <td className="px-4 py-2 border">
                                {new Date(cert.valid_until).toISOString().split("T")[0]}
                            </td>

                            <td className="px-4 py-2 border">
                                {/* <button className="underline text-blue-500">
                                    Download
                                </button> */}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );


    ////User
    const fetchUserCerts = async () => {
        setLoadingUser(true);
        setErrorUser("");

        try {
            const userRes = await axios.get(`${API_BASE_URL}/certificates/user/`);
            setUsercerts(userRes.data);

            // const userRes = usercertsmockdata;
            // setUsercerts(userRes);

            //   console.log("User certificates:", usercerts);
        } catch (err) {
            setErrorUser("Failed to fetch user certificates");
        } finally {
            setLoadingUser(false);
        }
    };


    useEffect(() => {
        if (activeTab === "user") {
            fetchUserCerts();
        }
    }, [activeTab]);


    const renderUserTable = () => (
        <table className="w-[75%] mx-auto border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100 text-gray-700 text-lg">
                <tr>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">Common Name</th>
                    <th className="px-4 py-2 border">Valid Until</th>
                    {/* <th className="px-4 py-2 border">Actions</th> */}
                </tr>
            </thead>

            <tbody>
                {usercerts.map((cert) => {
                    const remaining = daysRemaining(cert.valid_until);
                    const status = getStatusStyles(cert.is_active, remaining);

                    return (
                        <tr key={cert.id} className="border-b hover:bg-gray-50">

                            {/* Status */}
                            <td className="px-4 py-2 border">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded ${status.className}`}>
                                    {status.icon} {status.text}
                                </span>
                            </td>

                            {/* ID */}
                            <td className="px-4 py-2 border">{cert.id}</td>

                            {/* Common Name */}
                            <td className="px-4 py-2 border">{cert.common_name}</td>

                            {/* Valid Until — only date (YYYY-MM-DD) */}
                            <td className="px-4 py-2 border">
                                {new Date(cert.valid_until).toISOString().split("T")[0]}
                            </td>

                            {/* Actions */}
                            {/* <td className="px-4 py-2 border">
                                <button className="underline text-blue-500">
                                    Download
                                </button>
                            </td> */}

                        </tr>
                    );
                })}
            </tbody>
        </table>
    );


    ////allcerts

    useEffect(() => {
        if (activeTab === "allcerts") {
            fetchallcerts();
        }
    }, [activeTab]);


    const fetchallcerts = async () => {
        setLoading(true);
        setError("");

        try {
            console.log("Calling Certificate APIs...");

            ////    REAL API CALLS
            //   const token = "YOUR_TOKEN_HERE";   // Replace with real token

            // const rootallRes = await axios.get(
            //     `${API_BASE_URL}/root-cas/`,
            //     {
            //         headers: {
            //             Authorization: `Bearer ${token}`,
            //             "Content-Type": "application/json"
            //         }
            //     })
            //const rootallRes = await axios.get(`${API_BASE_URL}/organizations/root-cas/`);
            const intermediateallRes = await axios.get(`${API_BASE_URL}/intermediate-ca/`);
            // const issuedcertsallRes = await axios.get(`${API_BASE_URL}/certificates/`);

            //   setRootallcerts(rootallRes.data);
            setIntermediateallcerts(intermediateallRes.data);
            // setIssuedallcerts(issuedcertsallRes.data);

            ///////// MOCK DATA (remove later)
            // const rootallRes = rootCAmockdata;
            // const intermediateallRes = intermediatemockdata;
            // const issuedcertsallRes = issuedcertsmockdata;
            // setRootallcerts(rootallRes);
            // setIntermediateallcerts(intermediateallRes);
            // setIssuedallcerts(issuedcertsallRes);

            //console.log("Interrrrmediate:", intermediateallRes.data);
            // console.log("All certs:", certificatesRes);

        } catch (err) {
            setError("Failed to fetch certificate data.");
        } finally {
            setLoading(false);
        }
    };





    //////OrgId Certs
    useEffect(() => {
        fetchOrgIdCerts(orgId);
    }, [orgId]);
    const fetchOrgIdCerts = async (orgId: string) => {
        if (!orgId.trim()) {
            setOrgIdError("Please enter a valid organization ID.");
            setOrgIdCerts([]);
            return;
        }

        setOrgIdError("");
        setLoadingOrgIdCerts(true);

        try {
            const res = await axios.get(
                API_BASE_URL + "/organizations/" + orgId.trim() + "/certificates/"
            );
            setOrgIdCerts(res.data as OrgCertificate[]);
        } catch (err: any) {
            setOrgIdError("Failed to fetch certificates for this organization.");
            setOrgIdCerts([]);
        } finally {
            setLoadingOrgIdCerts(false);
        }
    };

    const renderOrgIdCertificates = () => {
        if (loadingOrgIdCerts) return <div>Loading certificates…</div>;
        if (orgIdError) return <div className="text-red-600">{orgIdError}</div>;

        if (orgIdCerts.length === 0)
            return <div className="text-gray-600">No certificates found for this organization.</div>;

        return (
            <div className="py-6 flex justify-center">
                <table className="py-6 w-[90%] border border-gray-300 rounded-xl shadow bg-white">
                    <thead className="bg-gray-100 text-lg">
                        <tr>
                            <th className="px-4 py-3 border">Status</th>
                            <th className="px-4 py-3 border">ID</th>
                            <th className="px-4 py-3 border">Common Name</th>
                            <th className="px-4 py-3 border">Key</th>
                            <th className="px-4 py-3 border">Valid Until</th>
                            <th className="px-4 py-3 border">Intermediate CA</th>
                        </tr>
                    </thead>

                    <tbody className="text-xl">
                        {orgIdCerts.map((cert) => {
                            const days = daysRemaining(cert.valid_until);
                            const status = getStatusStyles(cert.is_active, days);

                            return (
                                <tr key={cert.id} className="hover:bg-gray-50 text-lg">
                                    <td className="px-4 py-3 border">
                                        <span className={"px-3 py-1 rounded text-sm font-semibold " + status.className}>
                                            {status.text}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 border font-bold text-gray-800">{cert.id}</td>

                                    <td className="px-4 py-3 border text-blue-900 font-bold">
                                        {cert.common_name}
                                    </td>

                                    <td className="px-4 py-3 border">{cert.key_length} bits</td>

                                    <td
                                        className={
                                            "px-4 py-3 border font-semibold " +
                                            (days <= 30 ? "text-red-600" : "text-green-700")
                                        }
                                    >
                                        {new Date(cert.valid_until).toISOString().split("T")[0]}
                                    </td>

                                    <td className="px-4 py-3 border">
                                        {cert.intermediate_ca_id || "—"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };
    function Header() {
        return (
            <div className="flex justify-end p-3">
                <ThemeSelector />
            </div>
        );
    }

    /////Main RETURN////
    return (
        <div
            className="
    min-h-screen w-[75%] mx-auto flex flex-col 
    p-28 space-y-14
    bg-[var(--bg-primary)] text-[var(--text-primary)]
  "
        >
            {/* <div className="p-8 bg-white rounded-xl shadow-lg w-[75%] mx-auto"> */}
            {/* Header */}
            <header className="bg-[var(--header-bg)] text-[var(--header-text)] py-8 px-8 text-center rounded-lg shadow-md">
                <h1 className="text-5xl font-bold">GoSecure - AnchorVPN</h1>
                <p className="text-blue-200 font-semibold text-3xl mt-2">
                    User Certificate Management
                </p>
                <p className="text-blue-200 font-semibold text-left text-3xl mt-2">Welcome User</p>
            </header>
            <span className="text-2xl text-right font-extrabold text-[var(--text-primary)] whitespace-nowrap">
                <ThemeSelector />
            </span>



            {/* Main App Layout */}
            <div
                className="
        min-h-screen flex flex-col rounded-t-2xl shadow-inner
        bg-[var(--bg-secondary)]
        text-[var(--text-primary)]
    "
            >
                {/* Navigation Tabs */}
                <nav
                    className="
            w-full border-b px-4 py-3 flex flex-wrap justify-center gap-4
            bg-[var(--bg-primary)]
            text-[var(--text-primary)]
        "
                >
                    {[
                        { key: "certs", label: "Certificates by OrgId" },
                        { key: "download", label: "Download" },
                        { key: "servers", label: "Server Certs" },
                        { key: "user", label: "User Certs" },
                        { key: "allcerts", label: "All Certificates" },
                        { key: "help", label: "Help" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`
                    text-lg font-semibold px-4 py-2 rounded-md transition-colors duration-200
                    ${activeTab === tab.key
                                    ? "bg-[var(--accent-primary)] text-[var(--accent-text)]"
                                    : "text-[var(--text-primary)] hover:text-[var(--text-secondary)]"
                                }
                `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>


                {/* Active Tab Content */}
                <main
                    className="
        flex-grow p-8
        bg-[var(--bg-primary)]
        text-[var(--text-primary)]
    "
                >
                    {activeTab === "certs" && (
                        <div className="w-full">

                            {/* SUB TABS */}
                            <div
                                className="
        flex
        space-x-4
        pb-2
        mb-4
        border-b
        border-[var(--border-color)]
        text-[var(--text-primary)]
        bg-[var(--bg-primary)]
    "
                            >

                                <button
                                    onClick={() => setCertsSubTab("hierarchy")}
                                    className={
                                        `
        px-4 py-2 rounded-t font-bold text-lg transition-colors
        ` +
                                        (
                                            certsSubTab === "hierarchy"
                                                ? " bg-[var(--accent-primary)] text-[var(--text-on-accent)] "
                                                : " bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] "
                                        )
                                    }
                                >
                                    Certificate Hierarchy
                                </button>


                                <button
                                    onClick={() => setCertsSubTab("alerts")}
                                    className={
                                        "px-4 py-2 rounded-t font-semibold " +
                                        (certsSubTab === "alerts"
                                            ? " bg-[var(--accent-primary)] text-[var(--text-on-accent)] "
                                            : " bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] ")
                                    }
                                >
                                    Alerts
                                </button>
                                <button
                                    onClick={() => setCertsSubTab("issued")}
                                    className={
                                        "px-4 py-2 rounded-t font-semibold " +
                                        (certsSubTab === "issued"
                                            ? " bg-[var(--accent-primary)] text-[var(--text-on-accent)] "
                                            : " bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] ")
                                    }
                                >
                                    Issued Org Certs
                                </button>

                            </div>

                            {/* SUBTAB CONTENT */}
                            {certsSubTab === "hierarchy" && (
                                <>
                                    {renderCertFilters()}
                                    {renderExpandableTable()}
                                </>
                            )}
                            {certsSubTab === "alerts" && (
                                <>
                                    <div className="w-full flex justify-center">
                                        <div
                                            className="
                    bg-[var(--bg-card)]
                    border border-[var(--border-color)]
                    rounded-xl shadow-md
                    p-5
                    flex items-center gap-4
                    w-[90%]
                "
                                        >
                                            <span className="text-2xl font-extrabold text-[var(--text-primary)] whitespace-nowrap">
                                                Organization ID
                                            </span>

                                            <input
                                                type="text"
                                                placeholder="--Enter Org ID--"
                                                value={orgId}
                                                onChange={(e) => setOrgId(e.target.value)}
                                                className="
                        text-2xl font-semibold text-center
                        py-2 px-3
                        bg-[var(--bg-input)]
                        text-[var(--text-primary)]
                        border border-[var(--border-color)]
                        rounded-lg shadow-sm
                        focus:ring-2 focus:ring-[var(--accent-color)]
                        w-[300px]
                    "
                                            />
                                        </div>
                                    </div>
                                    {renderAlerts({ certs, intermediates })}
                                </>
                            )}

                            {certsSubTab === "issued" && (
                                <>
                                    <div className="w-full flex justify-center">
                                        <div
                                            className="
                    bg-[var(--bg-card)]
                    border border-[var(--border-color)]
                    rounded-xl shadow-md
                    p-5
                    flex items-center gap-4
                    w-[90%]
                "
                                        >
                                            <span className="text-2xl font-extrabold text-[var(--text-primary)] whitespace-nowrap">
                                                Organization ID
                                            </span>

                                            <input
                                                type="text"
                                                placeholder="--Enter Org ID--"
                                                value={orgId}
                                                onChange={(e) => setOrgId(e.target.value)}
                                                className="
                        text-2xl font-semibold text-center
                        py-2 px-3
                        bg-[var(--bg-input)]
                        text-[var(--text-primary)]
                        border border-[var(--border-color)]
                        rounded-lg shadow-sm
                        focus:ring-2 focus:ring-[var(--accent-color)]
                        w-[300px]
                    "
                                            />
                                        </div>
                                    </div>

                                    {renderOrgIdCertificates()}
                                </>
                            )}


                        </div>



                    )}


                    {/* {activeTab === "alerts" && renderAlerts({ certs, intermediates })} */}
                    {activeTab === "download" && renderDownloadTab()}
                    {activeTab === "servers" && renderServerCertsTable()}
                    {activeTab === "user" && renderUserTable()}
                    {activeTab === "allcerts" && (
                        <div className="p-4">

                            {/* SUB TABS */}
                            <div className="flex gap-4 mb-4 border-b pb-3 border-[var(--border-color)]">
                                <button
                                    onClick={() => setAllcertSubTab("root")}
                                    className={`
            px-4 py-2 text-lg font-semibold rounded
            ${allcertSubTab === "root"
                                            ? " bg-[var(--accent-primary)] text-[var(--text-on-accent)] "
                                            : " bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] "
                                        }
        `}
                                >
                                    Root Certificates
                                </button>

                                <button
                                    onClick={() => setAllcertSubTab("intermediate")}
                                    className={`
            px-4 py-2 text-lg font-semibold rounded
            ${allcertSubTab === "intermediate"
                                            ? " bg-[var(--accent-primary)] text-[var(--text-on-accent)] "
                                            : " bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] "}
        `}
                                >
                                    Intermediate Certs
                                </button>

                                <button
                                    onClick={() => setAllcertSubTab("issued")}
                                    className={`
            px-4 py-2 text-lg font-semibold rounded
            ${allcertSubTab === "issued"
                                            ? " bg-[var(--accent-primary)] text-[var(--text-on-accent)] "
                                            : " bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] "}
        `}
                                >
                                    Issued Certificates
                                </button>
                            </div>

                            {/* SUB TAB RENDER LOGIC */}
                            {/* {allcertSubTab === "root" && renderRootallTable()} */}

                            {allcertSubTab === "intermediate" && renderIntermediateallTable()}
                            {allcertSubTab === "issued" && renderIssuedCertsallTable()}
                            {/* {certSubTab === "root" && renderRootCertsTable()} */}

                        </div>
                    )}

                    {activeTab === "help" && renderHelp()}
                </main>

                {/* Footer */}
                <footer className="w-full text-center py-4 text-gray-500 text-sm border-t">
                    © GoSecure 2025
                </footer>
            </div>


        </div>


    );
}
