import React, { useEffect, useState } from "react";
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
        status: "Monitoring Status (All VPN Services)",
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
        <div className="min-h-screen flex bg-gray-50 text-sm">
            {/* Sidebar */}
            <div className="w-56 bg-gray-200 p-4 border-r border-gray-300 text-xs">
                <h2 className="text-lg font-semibold mb-3">VPN Monitoring</h2>
                <ul className="space-y-1 text-gray-700">
                    {Object.keys(apiHeadings).map((key) => (
                        <li key={key} className="font-medium">{apiHeadings[key]}</li>
                    ))}
                </ul>
            </div>

            {/* Main Dashboard */}
            <div className="flex-1 p-4 overflow-auto">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-48">
                        <div className="loader"></div>
                        <span className="mt-2 text-base font-semibold">
                            Fetching all monitoring data...
                        </span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.keys(apiEndpoints).map((key) => (
                            <div
                                key={key}
                                className="p-3 rounded-lg bg-white border border-gray-200"
                            >
                                <h2 className="text-sm font-semibold mb-1">{apiHeadings[key]}</h2>

                                {results[key]?.error ? (
                                    <p className="text-red-600">{results[key].error}</p>
                                ) : key === "health" ? (
                                    <HealthCard data={results[key]} />
                                ) : key === "status" ? (
                                    <StatusCard data={results[key]} />
                                ) : key === "services" ? (
                                    <ServicesCard data={results[key]} />
                                ) : (
                                    <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs">
                                        {JSON.stringify(results[key], null, 2)}
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
        .loader {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          width: 20px;
          height: 20px;
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
