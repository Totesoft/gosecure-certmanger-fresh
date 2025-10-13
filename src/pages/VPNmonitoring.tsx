import React, { useEffect, useState } from "react";
import { Card } from "@totesoft/ui-kit";
import HealthCard from "@/components/vpnmonitoring/healthcard";
import StatusCard from "@/components/vpnmonitoring/monitoringstatus";
import ServicesCard from "@/components/vpnmonitoring/listservicescard";

export default function VPNMonitoring() {
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState({});
    const [error, setError] = useState(null);

    const apiEndpoints = {
        health: "/api/monitoring/health",
        status: "/api/monitoring/status",
        metrics: "/api/monitoring/metrics",
        alerts: "/api/monitoring/alerts",
        services: "/api/monitoring/services",
        openvpn: "/api/monitoring/services/openvpn",
        wireguard: "/api/monitoring/services/wireguard",
        strongswan: "/api/monitoring/services/strongswan",
    };

    const apiHeadings = {
        health: "Monitoring Health",
        status: "Monitoring Status(All VPN Services)",
        metrics: "System Metrics",
        alerts: "Active Alerts",
        services: "List Monitored Services",
        openvpn: "OpenVPN Status",
        wireguard: "WireGuard Status",
        strongswan: "strongSwan Status",
    };

    useEffect(() => {
        async function fetchAll() {
            setLoading(true);
            setError(null);
            const newResults = {};

            await Promise.all(
                Object.entries(apiEndpoints).map(async ([key, url]) => {
                    try {
                        const res = await fetch(url);
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        const json = await res.json();
                        newResults[key] = json;
                    } catch (err) {
                        console.error(`Failed to fetch ${key}:`, err);
                        newResults[key] = { error: "Failed to load data" };
                    }
                })
            );

            setResults(newResults);
            setLoading(false);
        }

        fetchAll();
    }, []);

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-gray-200 p-6 border-r border-gray-300">
                <h2 className="text-xl font-semibold mb-4">VPN Monitoring</h2>
                <ul className="space-y-2 text-gray-700 text-sm">
                    {Object.keys(apiHeadings).map((key) => (
                        <li key={key} className="font-medium">
                            {apiHeadings[key]}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-auto space-y-6">
                {loading && (
                    <Card className="p-8 flex justify-center items-center">
                        <div className="loader"></div>
                        <span className="ml-3 text-lg">Fetching all monitoring data...</span>
                    </Card>
                )}

                {!loading &&
                    Object.keys(apiEndpoints).map((key) => (
                        <Card className="p-6" key={key}>
                            <h2 className="text-xl font-semibold mb-2">{apiHeadings[key]}</h2>
                            {results[key]?.error ? (
                                <p className="text-red-600">{results[key].error}</p>
                            ) : key === "health" ? (
                                <HealthCard data={results[key]} />
                            ) : key === "status" ? (
                                <StatusCard data={results[key]} />
                            ) : key === "services" ? (
                                <ServicesCard data={results[key]} />
                            ) : (
                                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                                    {JSON.stringify(results[key], null, 2)}
                                </pre>
                            )}
                        </Card>
                    ))}
            </div>

            <style>{`
                .loader {
                  border: 4px solid #f3f3f3;
                  border-top: 4px solid #007bff;
                  border-radius: 50%;
                  width: 24px;
                  height: 24px;
                  animation: spin 1s linear infinite;
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
