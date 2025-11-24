import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { intermediatemockdata, issuedcertsmockdata, usercertsmockdata, servercertsmockdata } from "./AdmnCertmanagerMockdata"
const API_BASE_URL = "https://pre-prod.be.anchorvpn.net/api/v1";

// ----------------------
// Interfaces
// ----------------------

interface Organization {
    id: number;
    name: string;
    root_ca_count: number;
}

interface OrganizationListResponse {
    organizations: Organization[];
    total: number;
}





interface CertificateItem {
    id: number;
    root_ca_id?: number;       // ADD THIS
    intermediate_ca_id?: number;
    organization_id?: number;
    common_name: string;
    certificate_type?: string;
    key_length: number;
    valid_from: string;
    valid_until: string;
    serial_number: string;
    is_active: boolean;
    created_at: string;
}


// ----------------------
// Tab Options
// ----------------------
type TabType = "certs" | "users" | "servers";

// ----------------------
// Main Component
// ----------------------
function AdminCertManager() {
    const [orgs, setOrgs] = useState<Organization[]>([]);


    const fetchOrganizations = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await axios.get<OrganizationListResponse>(`${API_BASE_URL}/admin/list-organizations`);
            setOrgs(response.data.organizations);
        } catch (err) {
            setError("Failed to load organizations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const [activeTab, setActiveTab] = useState<TabType>("certs");
    const [data, setData] = useState<CertificateItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [intermediateallcerts, setIntermediateallcerts] = useState<CertificateItem[]>([]);
    const [issuedallcerts, setIssuedallcerts] = useState<CertificateItem[]>([]);
    const [rootallcerts, setRootallcerts] = useState<CertificateItem[]>([]);
    const [usercerts, setUsercerts] = useState<CertificateItem[]>([]);
    const [loadingUser, setLoadingUser] = useState(false);
    const [errorUser, setErrorUser] = useState("");

    const [servercerts, setServercerts] = useState<CertificateItem[]>([]);
    const [loadingServer, setLoadingServer] = useState(false);
    const [errorServer, setErrorServer] = useState("");
    const [certSubTab, setCertSubTab] = useState<
        "intermediate" | "issued" | "root"
    >("intermediate");




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




    // ----------------------
    // API Handler
    // ----------------------
    const fetchallcerts = async () => {
        setLoading(true);
        setError("");

        try {
            console.log("Calling Certificate APIs...");

            // REAL API CALLS
            // const rootallRes = await axios.get(`${API_BASE_URL}/organizations/root-cas/`);
            // const intermediateallRes = await axios.get(`${API_BASE_URL}/intermediate-ca/`);
            // const issuedcertsallRes = await axios.get(`${API_BASE_URL}/certificates/`);
            // setIntermediateallcerts(intermediateRes.data);
            // setAllcerts(allcertsRes.data);

            // MOCK DATA (remove later)
            //      const rootRes = rootCAmockdata;
            const intermediateallRes = intermediatemockdata;
            const issuedcertsallRes = issuedcertsmockdata;
            // setRootcerts(rootRes);
            setIntermediateallcerts(intermediateallRes);
            setIssuedallcerts(issuedcertsallRes);

            //console.log("Intermediate:", intermediateRes);
            // console.log("All certs:", certificatesRes);

        } catch (err) {
            setError("Failed to fetch certificate data.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserCerts = async () => {
        setLoadingUser(true);
        setErrorUser("");

        try {
            // const userRes = await axios.get(`${API_BASE_URL}/certificates/user/`);
            // setUserCerts(res.data);

            const userRes = usercertsmockdata;
            setUsercerts(userRes);

            console.log("User certificates:", usercertsmockdata);
        } catch (err) {
            setErrorUser("Failed to fetch user certificates");
        } finally {
            setLoadingUser(false);
        }
    };


    const fetchServerCerts = async () => {
        setLoadingServer(true);
        setErrorServer("");

        try {
            // const serverRes = await axios.get(`${API_BASE_URL}/certificates/server/`);
            // setServercerts(serverRes.data);

            const serverRes = servercertsmockdata;   // mock array
            setServercerts(serverRes);

            console.log("Server certificates:", servercertsmockdata);
        } catch (err) {
            setErrorServer("Failed to fetch server certificates");
        } finally {
            setLoadingServer(false);
        }


    };

    // ----------------------------------------
    //Useffectss
    useEffect(() => {
        fetchallcerts();
    }, [activeTab]);

    useEffect(() => {
        fetchUserCerts();
    }, [activeTab]);

    useEffect(() => {
        fetchServerCerts();
    }, [activeTab]);



    // Render Table
    // ----------------------
    const renderTable = () => {
        if (loading) return <div className="p-4 text-gray-600">Loading...</div>;
        if (error) return <div className="p-4 text-red-500">{error}</div>;

        return (
            <div className="grid grid-cols-2 gap-6">

                {/* INTERMEDIATE CERTIFICATES */}
                <div className="border rounded-lg shadow p-4 bg-white">
                    <h2 className="text-xl font-semibold mb-4">Intermediate CerRRRRRRRRRRRRtificates</h2>

                    {intermediateallcerts.length === 0 ? (
                        <p className="text-gray-500">No Intermediate Certificates</p>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-100">
                                    <th className="p-2">ID</th>
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Valid Upto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {intermediateallcerts.map(item => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{item.id}</td>
                                        <td className="p-2">{item.common_name}</td>
                                        <td className="p-2">{item.valid_until}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ISSUED CERTIFICATES */}
                <div className="border rounded-lg shadow p-4 bg-white">
                    <h2 className="text-xl font-semibold mb-4">Issued Certificates</h2>

                    {issuedallcerts.length === 0 ? (
                        <p className="text-gray-500">No Certificates Found</p>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-100">
                                    <th className="p-2">ID</th>
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Valid Upto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issuedallcerts.map(item => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{item.id}</td>
                                        <td className="p-2">{item.common_name}</td>
                                        <td className="p-2">{item.valid_until}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        );
    };

    const renderIntermediateTable = () => (
        <table className="min-w-full border border-gray-200 rounded-lg shadow">
            <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">Common Name</th>
                    <th className="px-4 py-2 border">Valid Until</th>
                    <th className="px-4 py-2 border">Actions</th>
                </tr>
            </thead>

            <tbody>
                {intermediateallcerts.map((cert) => {
                    const days = daysRemaining(cert.valid_until);
                    const status = getStatusStyles(cert.is_active, days);

                    return (
                        <tr key={cert.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border">
                                <span className={`px-2 py-1 rounded text-sm ${status.className}`}>
                                    {status.text}
                                </span>
                            </td>
                            <td className="px-4 py-2 border">{cert.id}</td>
                            <td className="px-4 py-2 border">{cert.common_name}</td>
                            <td className="px-4 py-2 border">
                                {new Date(cert.valid_until).toISOString().split("T")[0]}
                            </td>
                            <td className="px-4 py-2 border">
                                <button className="underline text-blue-500">Download</button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
    const renderIssuedCertsTable = () => (
        <table className="min-w-full border border-gray-200 rounded-lg shadow">
            <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">Common Name</th>
                    <th className="px-4 py-2 border">Valid Until</th>
                    <th className="px-4 py-2 border">Actions</th>
                </tr>
            </thead>

            <tbody>
                {issuedallcerts.map((cert) => {
                    const days = daysRemaining(cert.valid_until);
                    const status = getStatusStyles(cert.is_active, days);

                    return (
                        <tr key={cert.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border">
                                <span className={`px-2 py-1 rounded text-sm ${status.className}`}>
                                    {status.text}
                                </span>
                            </td>
                            <td className="px-4 py-2 border">{cert.id}</td>
                            <td className="px-4 py-2 border">{cert.common_name}</td>
                            <td className="px-4 py-2 border">
                                {new Date(cert.valid_until).toISOString().split("T")[0]}
                            </td>
                            <td className="px-4 py-2 border">
                                <button className="underline text-blue-500">Download</button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );




    const renderUserTable = () => (
        <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100 text-gray-700 text-lg">
                <tr>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">Common Name</th>
                    <th className="px-4 py-2 border">Valid Until</th>
                    <th className="px-4 py-2 border">Actions</th>
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
                            <td className="px-4 py-2 border">
                                <button className="underline text-blue-500">
                                    Download
                                </button>
                            </td>

                        </tr>
                    );
                })}
            </tbody>
        </table>
    );

    const renderServerCertsTable = () => (
        <table className="min-w-full border border-gray-200 rounded-lg shadow">
            <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">Common Name</th>
                    <th className="px-4 py-2 border">Intermediate CA</th>
                    <th className="px-4 py-2 border">Valid Until</th>
                    <th className="px-4 py-2 border">Actions</th>
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
                                <button className="underline text-blue-500">
                                    Download
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );




    // ----------------------

    // UI Layout
    // ----------------------
    // ---------------------- RETURN ----------------------
    return (
        <div className="p-8 bg-white rounded-xl shadow-lg w-[75%] mx-auto">

            {/* HEADER */}
            <header className="bg-[#1b2067] text-white py-8 px-8 text-center rounded-lg shadow-md">
                <h1 className="text-5xl font-bold">GoSecure - AnchorVPN</h1>
                <p className="text-blue-200 font-semibold text-3xl mt-2">
                    Admin Certificate Management
                </p>
            </header>


            <div className="p-6">

                <h1 className="text-3xl font-bold mb-4">Organizations</h1>

                {loading && <p className="text-lg">Loading...</p>}
                {error && <p className="text-red-600 text-lg">{error}</p>}

                {!loading && !error && (
                    <table className="min-w-[70%] border border-gray-300 rounded-lg shadow bg-white">
                        <thead className="bg-gray-100 text-lg font-semibold">
                            <tr>
                                <th className="px-4 py-2 border">ID</th>
                                <th className="px-4 py-2 border">Name</th>
                                <th className="px-4 py-2 border">Root CAs</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orgs.map((org) => (
                                <tr key={org.id} className="hover:bg-gray-50 text-lg">
                                    <td className="px-4 py-2 border">{org.id}</td>
                                    <td className="px-4 py-2 border">{org.name}</td>
                                    <td className="px-4 py-2 border">{org.root_ca_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};










{/* TABS */ }
{/* <nav className="w-full bg-blue-50 border-b px-10 py-5 flex justify-center gap-x-10">
                {[
                    { key: "certs", label: "Certificates" },
                    { key: "users", label: "User Certs" },
                    { key: "servers", label: "Server Certs" },
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
 */}
{/* CARD WRAPPER */ }
{/* <div className="shadow-xl rounded-xl border border-gray-100 bg-white mt-6"> */ }

{/* CARD HEADER */ }
{/* <div className="p-4 border-b text-xl font-semibold">
                    {activeTab === "certs"}
                    {activeTab === "users"}
                    {activeTab === "servers"}
                    {activeTab === "help"}
                </div> */}

{/* CARD BODY (SEPARATED CONTENT) */ }
{/* <div className="p-4">
                    {activeTab === "certs" && (
                        <div className="p-4"> */}

{/* SUB TABS */ }
{/* <div className="flex gap-4 mb-4 border-b pb-3">
                                <button
                                    onClick={() => setCertSubTab("root")}
                                    className={`px-4 py-2 text-lg font-semibold rounded 
                        ${certSubTab === "root"
                                            ? "bg-[#1e28b6] text-white"
                                            : "text-blue-800 hover:text-blue-600"
                                        }`}
                                >
                                    Root Certificates
                                </button>
                                <button
                                    onClick={() => setCertSubTab("intermediate")}
                                    className={`px-4 py-2 text-lg font-semibold rounded 
                        ${certSubTab === "intermediate"
                                            ? "bg-[#1e28b6] text-white"
                                            : "text-blue-800 hover:text-blue-600"
                                        }`}
                                >
                                    Intermediate Certs
                                </button>

                                <button
                                    onClick={() => setCertSubTab("issued")}
                                    className={`px-4 py-2 text-lg font-semibold rounded 
                        ${certSubTab === "issued"
                                            ? "bg-[#1e28b6] text-white"
                                            : "text-blue-800 hover:text-blue-600"
                                        }`}
                                >
                                    Issued Certificates
                                </button>
                            </div> */}

{/* SUB TAB RENDER LOGIC */ }
{/* {certSubTab === "intermediate" && renderIntermediateTable()}
                            {certSubTab === "issued" && renderIssuedCertsTable()} */}
{/* {certSubTab === "root" && renderRootCertsTable()} */ }

{/* </div>
                    )}
                    {activeTab === "users" && renderUserTable()}
                    {activeTab === "servers" && renderServerCertsTable()}
                    {activeTab === "help" && <p>Help content here...</p>}
                </div>

            </div>*/}
{/* </div>
    );

} */}

export default AdminCertManager;
