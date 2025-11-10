import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AnchorVPNDashboard() {
    const [activeTab, setActiveTab] = useState("certs");
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const orgId = localStorage.getItem("orgId") || "1";

    useEffect(() => {
        if (activeTab === "certs" || activeTab === "alerts") fetchCerts();
    }, [activeTab]);

    const fetchCerts = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(
                `https://pre-prod.be.anchorvpn.net/api/v1/organizations/${orgId}/root-ca/`
            );
            setCerts(res.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const daysRemaining = (validUntil) => {
        const diff = new Date(validUntil).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const expiringSoon = certs.filter(
        (ca) => daysRemaining(ca.valid_until) <= 10 && ca.is_active
    );

    const renderCertTable = (data) => (
        <div className="overflow-x-auto mt-6">
            <table className="w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="border p-2 text-left">Common Name</th>
                        <th className="border p-2 text-left">Serial Number</th>
                        <th className="border p-2 text-left">Valid Until</th>
                        <th className="border p-2 text-left">Days Left</th>
                        <th className="border p-2 text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((ca) => {
                        const remaining = daysRemaining(ca.valid_until);
                        return (
                            <tr key={ca.id} className="hover:bg-gray-50">
                                <td className="border p-2">{ca.common_name}</td>
                                <td className="border p-2">{ca.serial_number}</td>
                                <td className="border p-2">
                                    {new Date(ca.valid_until).toLocaleDateString()}
                                </td>
                                <td
                                    className={`border p-2 font-medium ${remaining < 10
                                        ? "text-red-600"
                                        : remaining < 30
                                            ? "text-yellow-600"
                                            : "text-green-700"
                                        }`}
                                >
                                    {remaining} days
                                </td>
                                <td className="border p-2">
                                    {ca.is_active ? "Active" : "Expired"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-blue-100 text-blue-800 py-10 px-8 shadow-sm border-b border-blue-200 text-center">
                <h1 className="text-3xl font-bold">GoSecure - AnchorVPN</h1>
                <p className="text-blue-700 font-bold text-lg mt-2">
                    User Certificate Management
                </p>
            </header>


            {/* Top Navigation Tabs */}
            <div className="border-b border-gray-200 bg-white">
                <div className="flex space-x-6 px-8" style={{ marginLeft: "25%" }}>
                    <button
                        onClick={() => setActiveTab("certs")}
                        className={`py-3 px-4 font-medium ${activeTab === "certs"
                                ? "border-b-2 border-blue-600 text-blue-700"
                                : "text-gray-500 hover:text-blue-600"
                            }`}
                    >
                        My Certificates
                    </button>

                    <button
                        onClick={() => setActiveTab("alerts")}
                        className={`py-3 px-4 font-medium ${activeTab === "alerts"
                                ? "border-b-2 border-blue-600 text-blue-700"
                                : "text-gray-500 hover:text-blue-600"
                            }`}
                    >
                        Alerts
                    </button>
                </div>
            </div>


            {/* Tab Content */}
            <main className="max-w-6xl mx-auto mt-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                {loading && <p className="text-center text-gray-600">Loading...</p>}
                {error && (
                    <p className="text-red-600 bg-red-50 p-2 rounded mb-4 text-center">
                        Error: {error}
                    </p>
                )}

                {!loading && !error && (
                    <>
                        {activeTab === "certs" && (
                            <>
                                <h2 className="text-2xl font-semibold mb-4 text-blue-700 text-center">
                                    My Certificates
                                </h2>
                                {certs.length > 0
                                    ? renderCertTable(certs)
                                    : "No certificates found for your account."}
                            </>
                        )}

                        {activeTab === "alerts" && (
                            <>
                                <h2 className="text-2xl font-semibold mb-4 text-red-400 text-center">
                                    Certificates Expiring Soon
                                </h2>
                                {expiringSoon.length > 0
                                    ? renderCertTable(expiringSoon)
                                    : "No certificates expiring soon."}
                            </>
                        )}


                    </>
                )}
            </main>
        </div>
    );
}
