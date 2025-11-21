import React, { useEffect, useState } from "react";

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
        status: "Monitoring Status(All VPN services)",
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

    const renderHealth = (data) => {
        if (!data) return null;
        const time = new Date(data.timestamp * 1000).toLocaleString();
        return (
            <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                    <div
                        className={`w-4 h-4 flex items-center justify-center rounded bg-green-500 text-white`}
                    >
                        ✓
                    </div>
                    <span className="font-medium">{data.status}</span>
                </div>
                <div>
                    <span className="font-semibold">Version:</span> {data.version}
                </div>
                <div>
                    <span className="font-semibold">Last Checked:</span> {time}
                </div>
            </div>
        );
    };

    const renderStatus = (data) => {
        if (!data || !data.services) return <span>No status data</span>;
        return (
            <ul className="text-sm space-y-1">
                {data.services.map((svc, i) => (
                    <li key={i}>
                        <span className="font-medium">{svc.name}</span> -{" "}
                        <span className={svc.status === "running" ? "text-green-600" : "text-red-600"}>
                            {svc.status}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    const renderMetrics = (data) => {
        if (!data) return null;
        return (
            <div className="space-y-1 text-sm">
                {data.metrics?.length ? (
                    data.metrics.map((m, i) => (
                        <div key={i}>
                            <span className="font-medium">{m.name}:</span> {m.value}
                        </div>
                    ))
                ) : (
                    <div>No metrics available</div>
                )}
                <div>
                    <span className="font-semibold">Timestamp:</span> {data.timestamp}
                </div>
            </div>
        );
    };

    const renderAlerts = (data) => {
        if (!data) return null;
        return data.alerts?.length ? (
            <ul className="text-red-600 text-sm list-disc ml-4">
                {data.alerts.map((a, i) => (
                    <li key={i}>{a.message}</li>
                ))}
            </ul>
        ) : (
            <div className="text-sm text-gray-700">No active alerts</div>
        );
    };

    const renderServices = (data) => {
        if (!data) return null;
        return (
            <ul className="text-sm space-y-1">
                {data.services?.map((svc, i) => (
                    <li key={i}>
                        <div className="font-medium">{svc.name}</div>
                        <div>
                            Status:{" "}
                            <span className={svc.enabled ? "text-green-600" : "text-red-600"}>
                                {svc.enabled ? "Enabled" : "Disabled"}
                            </span>
                        </div>
                        <div className="text-gray-600 text-xs">
                            Config: {JSON.stringify(svc.config)}
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    const renderServiceDetail = (data) => {
        if (!data || !data.service) return <span>No data</span>;
        const s = data.service;
        return (
            <div className="text-sm space-y-1">
                <div className="font-medium">{s.Name}</div>
                <div>
                    Status:{" "}
                    <span className={s.Status === "active" ? "text-green-600" : "text-red-600"}>
                        {s.Status}
                    </span>
                </div>
                <div>Type: {s.Type}</div>
                <div>PID: {s.PID}</div>
                <div>Uptime: {s.Uptime}</div>
                <div>Connections: {s.Connections}</div>
                <div>Last Check: {new Date(s.LastCheck).toLocaleString()}</div>
                <div className="text-gray-600 text-xs">Config: {JSON.stringify(s.Config)}</div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex bg-gray-50 text-sm">
            {/* Sidebar */}
            <div className="w-56 bg-gray-200 p-4 border-r border-gray-300 text-xs">
                {/* <h3 className="text-3xl font-extrabold mb-6 border-b pb-2">VPN Monitoring</h3> */}
                <ul className="space-y-1 text-gray-700">
                    {Object.keys(apiHeadings).map((key) => (
                        <li key={key}>{apiHeadings[key]}</li>
                    ))}
                </ul>
            </div>

            {/* Dashboard */}
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="text-4xl font-extrabold mb-8 border-b pb-3">VPN Monitoring</h1>

                {loading ? (
                    <div className="flex items-center space-x-3">
                        <div className="loader"></div>
                        <span>Fetching monitoring data...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.keys(apiEndpoints).map((key) => (
                            <div
                                key={key}
                                className="p-4 border border-gray-200 rounded bg-white"
                            >
                                <h3 className="font-semibold mb-2">{apiHeadings[key]}</h3>

                                {results[key]?.error ? (
                                    <p className="text-red-600">{results[key].error}</p>
                                ) : key === "health" ? (
                                    renderHealth(results[key])
                                ) : key === "status" ? (
                                    renderStatus(results[key])
                                ) : key === "metrics" ? (
                                    renderMetrics(results[key])
                                ) : key === "alerts" ? (
                                    renderAlerts(results[key])
                                ) : key === "services" ? (
                                    renderServices(results[key])
                                ) : key === "openvpn" || key === "wireguard" || key === "strongswan" ? (
                                    renderServiceDetail(results[key])
                                ) : null}
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
