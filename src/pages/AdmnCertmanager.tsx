import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://pre-prod.be.anchorvpn.net/api/v1";

// ----------------------
// Interfaces
// ----------------------
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
    const [activeTab, setActiveTab] = useState<TabType>("certs");
    const [data, setData] = useState<CertificateItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [intermediatecerts, setIntermediatecerts] = useState<CertificateItem[]>([]);

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



    const intermediatemockdata = [
        {
            "id": 1,
            "root_ca_id": 3,
            "common_name": "Acme Corporation Intermediate CA",
            "key_length": 2048,
            "valid_from": "2025-11-06T22:41:40.033233",
            "valid_until": "2030-11-05T22:41:40.033233",
            "serial_number": "4994379141302451626",
            "is_active": true,
            "created_at": "2025-11-06T22:41:40.037650"
        },
        {
            "id": 2,
            "root_ca_id": 6,
            "common_name": "string",
            "key_length": 2048,
            "valid_from": "2025-11-07T20:47:45.471885",
            "valid_until": "2040-11-03T20:47:45.471885",
            "serial_number": "16778722553871774477",
            "is_active": true,
            "created_at": "2025-11-07T20:47:45.476273"
        },
        {
            "id": 3,
            "root_ca_id": 11,
            "common_name": "Testing Vpn",
            "key_length": 2048,
            "valid_from": "2025-11-11T11:48:32.013305",
            "valid_until": "2028-11-10T11:48:32.013305",
            "serial_number": "15763023027614208435",
            "is_active": true,
            "created_at": "2025-11-11T11:48:32.016445"
        },
        {
            "id": 4,
            "root_ca_id": 11,
            "common_name": "Testing Vpn",
            "key_length": 2048,
            "valid_from": "2025-11-11T13:58:10.592856",
            "valid_until": "2028-11-10T13:58:10.592856",
            "serial_number": "414777907911654799",
            "is_active": true,
            "created_at": "2025-11-11T13:58:10.596297"
        },
        {
            "id": 5,
            "root_ca_id": 11,
            "common_name": "Testing Vpn",
            "key_length": 2048,
            "valid_from": "2025-11-12T12:33:32.918565",
            "valid_until": "2028-11-11T12:33:32.918565",
            "serial_number": "6022716513441660464",
            "is_active": true,
            "created_at": "2025-11-12T12:33:32.921774"
        },
        {
            "id": 6,
            "root_ca_id": 11,
            "common_name": "Testing Vpn",
            "key_length": 2048,
            "valid_from": "2025-11-14T15:04:07.778774",
            "valid_until": "2028-11-13T15:04:07.778774",
            "serial_number": "3122604181276642890",
            "is_active": true,
            "created_at": "2025-11-14T15:04:07.782553"
        },
        {
            "id": 7,
            "root_ca_id": 11,
            "common_name": "Testing Vpn",
            "key_length": 2048,
            "valid_from": "2025-11-14T15:05:08.614218",
            "valid_until": "2028-11-13T15:05:08.614218",
            "serial_number": "6434876828805156834",
            "is_active": true,
            "created_at": "2025-11-14T15:05:08.617094"
        }
    ]

    const certificatesmockdata = [
        {
            "id": 2,
            "intermediate_ca_id": 1,
            "common_name": "vpn.acme.com",
            "certificate_type": "server",
            "key_length": 2048,
            "valid_from": "2025-11-06T22:41:40.453143",
            "valid_until": "2027-11-06T22:41:40.453143",
            "serial_number": "349187585951979826",
            "is_active": true,
            "created_at": "2025-11-06T22:41:40.454993"
        },
        {
            "id": 1,
            "intermediate_ca_id": 1,
            "common_name": "john.doe@acme.com",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-06T22:41:40.253605",
            "valid_until": "2026-11-06T22:41:40.253605",
            "serial_number": "7372327794352391371",
            "is_active": false,
            "created_at": "2025-11-06T22:41:40.257400"
        },
        {
            "id": 3,
            "intermediate_ca_id": 1,
            "common_name": "user@example.com",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-07T14:26:30.283207",
            "valid_until": "2026-11-07T14:26:30.283207",
            "serial_number": "1756264145815151120",
            "is_active": true,
            "created_at": "2025-11-07T14:26:30.290184"
        },
        {
            "id": 4,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-14T10:55:02.564116",
            "valid_until": "2026-11-14T10:55:02.564116",
            "serial_number": "4540243803565873181",
            "is_active": true,
            "created_at": "2025-11-14T10:55:02.567685"
        },
        {
            "id": 5,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-14T12:00:23.726510",
            "valid_until": "2026-11-14T12:00:23.726510",
            "serial_number": "9703584742982487789",
            "is_active": true,
            "created_at": "2025-11-14T12:00:23.731368"
        },
        {
            "id": 6,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-14T12:00:43.176467",
            "valid_until": "2026-11-14T12:00:43.176467",
            "serial_number": "14195893454658783704",
            "is_active": true,
            "created_at": "2025-11-14T12:00:43.178242"
        },
        {
            "id": 7,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "user",
            "key_length": 2048,
            "valid_from": "2025-11-14T14:00:01.371684",
            "valid_until": "2026-11-14T14:00:01.371684",
            "serial_number": "13423368161583545335",
            "is_active": true,
            "created_at": "2025-11-14T14:00:01.375002"
        },
        {
            "id": 8,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "server",
            "key_length": 2048,
            "valid_from": "2025-11-14T14:00:25.775808",
            "valid_until": "2026-11-14T14:00:25.775808",
            "serial_number": "7065779165814479209",
            "is_active": true,
            "created_at": "2025-11-14T14:00:25.780022"
        },
        {
            "id": 9,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "server",
            "key_length": 2048,
            "valid_from": "2025-11-14T14:25:30.623358",
            "valid_until": "2026-11-14T14:25:30.623358",
            "serial_number": "17098717075885615628",
            "is_active": true,
            "created_at": "2025-11-14T14:25:30.627765"
        },
        {
            "id": 10,
            "intermediate_ca_id": 1,
            "common_name": "string",
            "certificate_type": "server",
            "key_length": 2048,
            "valid_from": "2025-11-14T14:25:34.408041",
            "valid_until": "2026-11-14T14:25:34.408041",
            "serial_number": "1061544153395070501",
            "is_active": true,
            "created_at": "2025-11-14T14:25:34.410441"
        }
    ]
    // ----------------------
    // API Handler
    // ----------------------
    const fetchallcerts = async () => {
        setLoading(true);
        setError("");
        try {
            // const res = await axios.get(`${API_BASE_URL}/intermediate-ca/`);
            // const res = await axios.get(`${API_BASE_URL}/certificates/`);

            const res = intermediatemockdata; // array
            setIntermediatecerts(res);   // Set array directly
            console.log("response:", res);
        } catch (err) {
            setError("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchallcerts();
    }, [activeTab]);

    // ----------------------
    // Render Table
    // ----------------------
    const renderTable = () => {
        if (loading) return <div className="p-4 text-gray-600">Loading...</div>;
        if (error) return <div className="p-4 text-red-500">{error}</div>;
        //    if (!data.length) return <div className="p-4 text-gray-500">No records found.</div>;

        return (
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b bg-gray-100">
                        <th className="p-3">ID</th>
                        <th className="p-3">Common Name</th>
                        <th className="p-3">Serial No</th>
                        <th className="p-3">Created At</th>
                        <th className="p-3">Active</th>
                    </tr>
                </thead>
                <tbody>
                    <tbody>
                        {intermediatecerts.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.common_name}</td>
                                <td>{item.serial_number}</td>
                                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                <td>{item.is_active ? "Yes" : "No"}</td>
                            </tr>
                        ))}
                    </tbody>

                </tbody>
            </table>
        );
    };

    // ----------------------
    // UI Layout
    // ----------------------
    return (
        <div className="p-8 bg-white rounded-xl shadow-lg w-[75%] mx-auto">
            <header className="bg-[#1b2067] text-white py-8 px-8 text-center rounded-lg shadow-md">
                <h1 className="text-5xl font-bold">GoSecure - AnchorVPN</h1>
                <p className="text-blue-200 font-semibold text-3xl mt-2">
                    Admin Certificate Management
                </p>
            </header>
            <nav className="w-full bg-blue-50 border-b px-10 py-5 flex justify-center gap-x-10">
                {[
                    { key: "certs", label: "Certificates" },
                    { key: "users", label: "User" },
                    { key: "servers", label: "Server Details" },
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
            <div className="shadow-xl rounded-xl border border-gray-100 bg-white">
                <div className="p-4 border-b">
                    <div className="text-xl font-semibold">
                        {activeTab === "certs" && "All Certificates"}
                        {activeTab === "users" && "User Certificates"}
                        {activeTab === "servers" && "Server Certificates"}
                    </div>

                </div>
                <div className="p-4">
                    {renderTable()}
                </div>
            </div>
        </div>
    );
}

export default AdminCertManager;
