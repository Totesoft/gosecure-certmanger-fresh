import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@totesoft/ui-kit"
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { useServerCerts, RenderServerCertsTable } from "@/hooks/useServerCerts";
import { useUserCerts, RenderUserCertsTable } from "@/hooks/useUserCerts"
import { useAllCerts } from "@/hooks/useAllCerts"; // adjust path
import DownloadCert from "@/components/Usercertmanager/Downloadcert";
import RenderAlerts from "@/components/Usercertmanager/renderAlerts";  // adjust path
import { useOrgIdCertificates } from "@/components/Usercertmanager/OrgIdCerts"
import { renderHelp } from "@/components/Usercertmanager/Help";

//import { rootCAmockdata, intermediatemockdata, issuedcertsmockdata, usercertsmockdata, servercertsmockdata } from "./AdmnCertmanagerMockdata"
//import { token } from "@/components/token"
import ThemeSelector from "@/context/ThemeSelector";
import type { ExpandState, LeafCertificate, IntermediateCertificate, RootCertificate, ServerCertificate, UserCertificate, OrgCertificate } from "@/types/UserCerttypes"

const API_BASE_URL = "https://pre-prod.be.anchorvpn.net/api/v1"; // adjust if needed

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
    const [expandedRoot, setExpandedRoot] = useState<ExpandState>({});
    const [expandedInter, setExpandedInter] = useState<ExpandState>({});
    const [allcertSubTab, setAllcertSubTab] = useState<
        "intermediate" | "issued" | "root"
    >("intermediate");
    const [certsSubTab, setCertsSubTab] = useState("hierarchy");
    const { servercerts, fetchServercerts } = useServerCerts();
    const { usercerts, fetchUserCerts } = useUserCerts()
    const { renderRootallTable, renderIntermediateallTable, renderIssuedCertsallTable, fetchAllCerts } = useAllCerts();
    const { renderOrgIdCertificates } = useOrgIdCertificates(orgId);

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

    function formatDate(value: string | number | Date) {
        if (!value) return "";

        const date = value instanceof Date ? value : new Date(value);

        if (isNaN(date.getTime())) return "";

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    const daysRemaining = (validUntil: string | number | Date) => {
        const diff = new Date(validUntil).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const getStatusStyles = (isActive: boolean, days: number) => {
        if (!isActive) return { text: "Inactive", className: "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200" };
        if (days <= 30) return { text: "Expiring Soon", className: "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200" };
        return { text: "Active", className: "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200" };
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



    const totalRoots = certs.length;

    // Count all intermediate certs in the intermediates map
    const totalIntermediates = Object.values(intermediates).reduce(
        (acc, arr) => acc + arr.length,
        0
    );

    // Count ALL leaf certs for ALL intermediates
    const totalLeafCertificates = Object.values(intermediates).reduce(
        (acc, arr) =>
            acc +
            arr.reduce(
                (innerAcc, int) =>
                    innerAcc + (int.issued_certificates?.length || 0),
                0
            ),
        0
    );




    //Hierarchy Table
    const renderExpandableTable = () => {
        if (certs.length === 0)
            return (
                <div className="text-center text-gray-600 text-xl mt-4">
                    No certificates found
                </div>
            );

        return (
            <div>
                <div className="w-full p-4  flex items-center justify-around text-xl font-extrabold text-foreground">
                    <div>
                        Root Certificates : <span className="text-primary">{totalRoots}</span>
                    </div>
                    <div>
                        Intermediate Certificates : <span className="text-primary">{totalIntermediates}</span>
                    </div>
                    <div>
                        Issued Certificates : <span className="text-primary">{totalLeafCertificates}</span>
                    </div>
                </div>

                <div className="space-y-6 w-full mx-auto">
                    {renderCertFilters()}

                </div>

                <h2 className="text-2xl font-extrabold text-primary mb-2">
                    Root Certificates:    {totalRoots}
                </h2>

                {certs.map((root) => {
                    const rootIntermediates = intermediates[root.id] || [];
                    const interCount = rootIntermediates.length;

                    const rem = daysRemaining(root.valid_until);
                    const status = getStatusStyles(root.is_active, rem);

                    return (
                        <Card
                            key={root.id}
                            className="rounded-xl shadow-sm border border-border overflow-hidden bg-card"
                        >
                            <div
                                onClick={() => toggleRoot(root.id)}
                                className={cn(
                                    "p-6 cursor-pointer flex justify-between items-center border-b",
                                    "bg-muted hover:bg-muted/70 border-border"
                                )}
                            >
                                <div className="flex items-center gap-12 text-2xl">
                                    <span className="font-semibold text-foreground/80 text-xl">
                                        ID: {root.id}
                                    </span>

                                    <span className="font-bold text-primary text-3xl">
                                        {root.common_name}
                                    </span>

                                    <span className="text-muted-foreground text-xl">
                                        {root.key_length} bits
                                    </span>

                                    <span
                                        className={cn(
                                            "font-semibold text-xl",
                                            rem <= 30 ? "text-destructive" : "text-green-600"
                                        )}
                                    >
                                        Expires: {formatDate(root.valid_until)}
                                    </span>

                                    <span className="font-semibold text-primary text-xl">
                                        Intermediates: {interCount}
                                    </span>
                                </div>

                                <Badge className={cn("px-4 py-1 text-xl", status.className)}>
                                    {status.text}
                                </Badge>

                                <div className="text-5xl text-muted-foreground">
                                    {expandedRoot[root.id] ? "−" : "+"}
                                </div>
                            </div>

                            {expandedRoot[root.id] && (
                                <div className="p-6 space-y-5">
                                    {interCount > 0 ? (
                                        <>
                                            <h3 className="pl-40 text-2xl font-extrabold text-foreground/90">
                                                Intermediate Certificates
                                            </h3>

                                            {rootIntermediates.map((int) => {
                                                const remI = daysRemaining(int.valid_until);
                                                const statusI = getStatusStyles(int.is_active, remI);
                                                const leafCerts = int.issued_certificates || [];

                                                return (
                                                    <Card
                                                        key={int.id}
                                                        className="bg-muted border border-border rounded-xl"
                                                    >
                                                        <div
                                                            onClick={() => toggleInter(int.id)}
                                                            className="p-5 cursor-pointer hover:bg-muted/70 flex justify-between items-center"
                                                        >
                                                            <div className="flex items-center gap-12 text-xl ml-8">
                                                                <span className="font-semibold text-foreground/80 text-xl">
                                                                    ID: {int.id}
                                                                </span>

                                                                <span className="font-bold text-primary text-3xl">
                                                                    {int.common_name}
                                                                </span>

                                                                <span className="text-muted-foreground text-xl">
                                                                    {int.key_length} bits
                                                                </span>

                                                                <span
                                                                    className={cn(
                                                                        "font-semibold text-xl",
                                                                        remI <= 30 ? "text-destructive" : "text-green-600"
                                                                    )}
                                                                >
                                                                    Expires: {formatDate(int.valid_until)}
                                                                </span>

                                                                <span className="font-semibold text-primary text-xl">
                                                                    Certificates: {leafCerts.length}
                                                                </span>
                                                            </div>

                                                            <Badge className={cn("px-4 py-1 text-lg", statusI.className)}>
                                                                {statusI.text}
                                                            </Badge>

                                                            <div className="text-5xl text-muted-foreground">
                                                                {expandedInter[int.id] ? "−" : "+"}
                                                            </div>
                                                        </div>

                                                        {expandedInter[int.id] && (
                                                            <div className="p-6 pl-12 space-y-4 border-t border-border">
                                                                {leafCerts.length > 0 ? (
                                                                    <>
                                                                        <h4 className="text-xl font-bold text-muted-foreground ml-12">
                                                                            Issued Certificates
                                                                        </h4>

                                                                        <Table className="w-[90%] ml-20">
                                                                            <TableHeader>
                                                                                <TableRow>
                                                                                    <TableHead>ID</TableHead>
                                                                                    <TableHead>Common Name</TableHead>
                                                                                    <TableHead>Key Length</TableHead>
                                                                                    <TableHead>Expiry</TableHead>
                                                                                    <TableHead>Status</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>

                                                                            <TableBody>
                                                                                {leafCerts.map((leaf: { valid_until: string | number | Date; is_active: boolean | undefined; id: any; common_name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; key_length: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => {
                                                                                    const remL = daysRemaining(leaf.valid_until);
                                                                                    const statusL = getStatusStyles(
                                                                                        leaf.is_active,
                                                                                        remL
                                                                                    );

                                                                                    return (
                                                                                        <TableRow key={String(leaf.id)} className="text-xl">
                                                                                            <TableCell className="font-semibold text-foreground/80">
                                                                                                {String(leaf.id)}
                                                                                            </TableCell>

                                                                                            <TableCell className="font-bold text-primary">
                                                                                                {leaf.common_name}
                                                                                            </TableCell>

                                                                                            <TableCell className="text-muted-foreground">
                                                                                                {leaf.key_length} bits
                                                                                            </TableCell>

                                                                                            <TableCell
                                                                                                className={cn(
                                                                                                    "font-semibold",
                                                                                                    remL <= 30
                                                                                                        ? "text-destructive"
                                                                                                        : "text-green-600"
                                                                                                )}
                                                                                            >
                                                                                                {formatDate(leaf.valid_until)}
                                                                                            </TableCell>

                                                                                            <TableCell>
                                                                                                <Badge className={statusL.className}>
                                                                                                    {statusL.text}
                                                                                                </Badge>
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    );
                                                                                })}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </>
                                                                ) : (
                                                                    <div className="text-muted-foreground text-lg ml-12">
                                                                        No issued certificates available
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Card>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <div className="text-muted-foreground text-xl ml-4">
                                            No intermediate certificates available
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        );

    };


    // applyFilters: produces certs + intermediates states (UI-ready)// accepts optional params so callers can pass freshly fetched data
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
    //Filter
    const renderCertFilters = () => (
        <div className="w-full ">

            {/* <CardHeader>
                <CardTitle className="text-[var(--text-primary)] text-center">
                    Certificate Filters
                </CardTitle>
            </CardHeader> */}

            <CardContent>

                <div className="w-full flex flex-wrap gap-4 justify-between items-end bg-[var(--filter-bg)] p-4 rounded-lg">

                    {/* Root ID */}
                    <div className="flex flex-col flex-1 min-w-[250px]">
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
                    <div className="flex flex-col flex-1 min-w-[250px]">
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
                    <div className="flex flex-col flex-1 min-w-[250px]">
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
                    <div className="flex flex-col flex-1 min-w-[250px]">
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
            </CardContent>

        </div>
    );


    //UseEffect
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
    useEffect(() => {
        if (activeTab === "servers") {
            fetchServercerts();
        }
    }, [activeTab]);
    useEffect(() => {
        if (activeTab === "user") {
            fetchUserCerts();
        }
    }, [activeTab]);
    useEffect(() => {
        if (activeTab === "allcerts") {
            fetchAllCerts();
        }
    }, [activeTab]);


    return (


        // 1. MAIN CONTAINER: More breathing room, controlled max width
        <div
            // REVISED MAIN CONTAINER: Explicitly w-[85%] and centered (mx-auto)
            className="min-h-screen w-[80%] mx-auto flex flex-col p-12 space-y-12 
        bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-2xl shadow-2xl"
        >
            {/* REVISED HEADER: Using relative positioning for Welcome User */}
            <header className=" bg-[var(--header-bg)] text-[var(--header-text)] py-10 px-8 
            rounded-xl shadow-lg border-b-4 border-indigo-700 relative">

                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        GoSecure - AnchorVPN
                    </h1>
                    <p className="font-medium text-xl mt-1 opacity-90">
                        User Certificate Management
                    </p>
                </div>

                {/* Welcome User positioned bottom-left, within the header box */}
                <div className="absolute bottom-4 left-8">
                    <p className="text-xl font-medium text-[var(--header-text)]">
                        Welcome User
                    </p>
                </div>
            </header>

            {/* Main App Layout */}
            <div
                className=" flex flex-col rounded-t-2xl shadow-inner bg-[var(--bg-primary)] text-[var(--text-primary)] "
            >
                {/* 2. NAVIGATION TABS: Minimalist, bottom-border style */}
                <nav
                    className="w-full px-4 pt-3 pb-0 flex items-center justify-between bg-[var(--bg-primary)] border-b-2 border-[var(--border-color)]"
                >
                    <div className="flex gap-8">
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
                                className={`text-lg font-semibold px-2 pb-3 transition-colors duration-200
                                ${activeTab === tab.key
                                        ? "text-[var(--accent-primary)] border-b-4 border-[var(--accent-primary)]"
                                        : "text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
                                    }
                            `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {/* Theme Selector */}
                    <div className="flex justify-end">
                        <ThemeSelector />
                    </div>
                </nav>

                {/* Active Tab Content */}
                <main
                    className="flex-grow p-8 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-b-xl"
                >
                    {activeTab === "certs" && (
                        <div className="w-full space-y-6">

                            {/* 3. SUB TABS: Rounded pills with better spacing */}
                            <div
                                className="flex space-x-4 pb-2 text-[var(--text-primary)]"
                            >
                                <button
                                    onClick={() => setCertsSubTab("hierarchy")}
                                    className={`px-5 py-2 rounded-full font-medium text-sm transition-colors shadow-sm` +
                                        (
                                            certsSubTab === "hierarchy"
                                                ? " bg-[var(--accent-primary)] text-[var(--text-on-accent)] "
                                                : " bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] "
                                        )
                                    }
                                >
                                    Certificate Hierarchy
                                </button>
                                <button
                                    onClick={() => setCertsSubTab("alerts")}
                                    className={
                                        "px-5 py-2 rounded-full font-medium text-sm transition-colors shadow-sm " +
                                        (certsSubTab === "alerts"
                                            ? " bg-red-600 text-white " // Use red for Alerts
                                            : " bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] ")
                                    }
                                >
                                    Alerts
                                </button>
                                <button
                                    onClick={() => setCertsSubTab("issued")}
                                    className={
                                        "px-5 py-2 rounded-full font-medium text-sm transition-colors shadow-sm " +
                                        (certsSubTab === "issued"
                                            ? " bg-[var(--accent-primary)] text-[var(--text-on-accent)] "
                                            : " bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] ")
                                    }
                                >
                                    Issued Org Certs
                                </button>
                            </div>

                            {/* Org ID Input Area - Cleaned up and aligned */}
                            <div className="flex items-center space-x-4 border-b pb-4 border-[var(--border-color)]">
                                <span className="text-lg font-bold text-[var(--text-primary)]">
                                    Organization ID:
                                </span>

                                <input
                                    type="text"
                                    placeholder="5" // Use the value from the image
                                    value={orgId}
                                    onChange={(e) => setOrgId(e.target.value)}
                                    className="text-lg font-semibold text-center py-2 px-3 bg-[var(--bg-input)]
                                    text-[var(--text-primary)] border-2 border-[var(--border-color)] 
                                    rounded-lg shadow-inner focus:ring-2 focus:ring-[var(--accent-primary)] w-[100px]"
                                />
                            </div>

                            {/* SUBTAB CONTENT */}
                            {certsSubTab === "hierarchy" && (
                                <>
                                    {renderExpandableTable()}
                                </>
                            )}
                            {certsSubTab === "alerts" && (
                                <RenderAlerts
                                    certs={certs}
                                    intermediates={intermediates}
                                    loading={false}
                                    error={null}
                                    orgId={orgId}
                                    setOrgId={setOrgId}
                                />
                            )}
                            {certsSubTab === "issued" && renderOrgIdCertificates()}
                        </div>
                    )}
                    {activeTab === "download" && <DownloadCert />}
                    {activeTab === "servers" && (<RenderServerCertsTable servercerts={servercerts} />)}
                    {activeTab === "user" && <RenderUserCertsTable usercerts={usercerts} />}
                    {activeTab === "allcerts" && (
                        <div className="p-4 bg-[var(--bg-primary)] rounded-xl shadow-inner">
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
                                    className={`px-4 py-2 text-lg font-semibold rounded
                                ${allcertSubTab === "intermediate"
                                            ? " bg-[var(--accent-primary)] text-[var(--text-on-accent)] "
                                            : " bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] "}
                                `}
                                >
                                    Intermediate Certs
                                </button>

                                <button
                                    onClick={() => setAllcertSubTab("issued")}
                                    className={`px-4 py-2 text-lg font-semibold rounded
                                ${allcertSubTab === "issued"
                                            ? " bg-[var(--accent-primary)] text-[var(--text-on-accent)] "
                                            : " bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] "}
                                `}
                                >
                                    Issued Certificates
                                </button>
                            </div>
                            {allcertSubTab === "root" && renderRootallTable()}
                            {allcertSubTab === "intermediate" && renderIntermediateallTable()}
                            {allcertSubTab === "issued" && renderIssuedCertsallTable()}
                        </div>
                    )}
                    {activeTab === "help" && renderHelp()}
                </main>

                {/* Footer */}
                <footer className="w-full text-center py-3 text-[var(--text-secondary)] text-sm border-t border-[var(--border-color)] bg-[var(--bg-primary)] rounded-b-xl">
                    © GoSecure 2025
                </footer>
            </div >
        </div >
    );
}
