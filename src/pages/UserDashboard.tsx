import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@totesoft/ui-kit";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@totesoft/ui-kit";

interface Cert {
    id: string;
    commonName: string;
    serialNumber: string;
    issuer: string;
    validFrom: string;
    validTo: string;
}

const UserDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [orgId, setOrgId] = useState("");
    const [certs, setCerts] = useState<Cert[]>([]);
    const [dashboardData, setDashboardData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleOrgIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOrgId(e.target.value);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/fetch-dashboard-data"); // example endpoint
            const data = await response.json();

            // Ensure it's an array before setting
            if (Array.isArray(data.rootData)) {
                setDashboardData(data.rootData);
            } else if (data.rootData) {
                setDashboardData([data.rootData]);
            } else {
                setDashboardData([]);
            }

            if (Array.isArray(data.certs)) {
                setCerts(data.certs);
            } else if (data.certs) {
                setCerts([data.certs]);
            } else {
                setCerts([]);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderCertCards = (certs: Cert[]) => (
        <div className="flex flex-wrap justify-center gap-4">
            {certs.map((cert) => (
                <Card key={cert.id} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 border border-gray-200 shadow-md">
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-blue-700">ID: {cert.id}</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col space-y-1 text-sm text-gray-700">
                            <p><strong>Common Name:</strong> {cert.commonName}</p>
                            <p><strong>Serial No:</strong> {cert.serialNumber}</p>
                            <p><strong>Issuer:</strong> {cert.issuer}</p>
                            <p><strong>Valid From:</strong> {cert.validFrom}</p>
                            <p><strong>Valid To:</strong> {cert.validTo}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    const renderDashboardCards = (data: any[]) => (
        <div className="flex flex-wrap justify-center gap-4">
            {data.map((item, idx) => (
                <Card key={idx} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 border border-gray-200 shadow-md">
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-green-700">Dashboard Item</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col space-y-1 text-sm text-gray-700">
                            {Object.entries(item).map(([key, value]) => (
                                <p key={key}><strong>{key}:</strong> {String(value)}</p>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex justify-center mb-4">
                <input
                    type="text"
                    value={orgId}
                    onChange={handleOrgIdChange}
                    placeholder="Enter Org ID"
                    className="border border-gray-300 rounded px-3 py-1 w-40 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex justify-center mb-6 space-x-4">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="certs">Certificates</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <h2 className="text-2xl font-semibold mb-4 text-green-700 text-center">Dashboard Overview</h2>
                    {loading ? (
                        <p className="text-center text-gray-600">Loading...</p>
                    ) : dashboardData.length > 0 ? (
                        renderDashboardCards(dashboardData)
                    ) : (
                        <p className="text-gray-600 text-center">No dashboard data available.</p>
                    )}
                </TabsContent>

                <TabsContent value="certs">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-700 text-center">My Certificates</h2>
                    {loading ? (
                        <p className="text-center text-gray-600">Loading...</p>
                    ) : certs.length > 0 ? (
                        renderCertCards(certs)
                    ) : (
                        <p className="text-gray-600 text-center">No certificates found for your account.</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default UserDashboard;
