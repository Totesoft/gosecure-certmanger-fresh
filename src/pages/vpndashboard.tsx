import React, { useState, useEffect } from "react";
import { Loader2, Users, AlertTriangle, Clock, BarChart, Database, Activity } from "lucide-react";
import { Doughnut, Bar } from "react-chartjs-2";
import { CheckCircle, XCircle } from "lucide-react"; // import icons
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";
import {
    getMonitoringHealth,
    getMonitoringStatus,
    getMonitoringMetrics,
    getMonitoringAlerts,
    getMonitoredServices,
    getOpenVPNService,
    getWireGuardService,
    getStrongSwanService,
} from "@/api/vpn-monitor-apis";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const getStatusBadge = (status) => {
    if (!status) return "bg-gray-500 text-white";
    const s = status.toLowerCase();
    if (s === "active" || s === "healthy" || s === "running") return "bg-green-500 text-white";
    if (s === "inactive" || s === "stopped") return "bg-red-500 text-white";
    return "bg-gray-500 text-white";
};

const MetricCard = ({ icon, title, value, subtext }) => (
    <div className=" border-t-primary p-4 rounded-xl hover:shadow-xl transition border-gray-100">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold uppercase text-sm">{title}</h3>
            {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm mt-1">{subtext}</p>
    </div>
);

const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start space-x-3 p-3 rounded-lg shadow-sm">
        <div className="pt-1">{icon}</div>
        <div>
            <p className="text-sm font-medium uppercase">{label}</p>
            <p className="font-bold">{value ?? "N/A"}</p>
        </div>
    </div>
);

const VpnDashboard = () => {
    const [health, setHealth] = useState({});
    const [status, setStatus] = useState({});
    const [metrics, setMetrics] = useState({});
    const [alerts, setAlerts] = useState([]);
    const [services, setServices] = useState([]);
    const [ovpn, setOvpn] = useState(null);
    const [wireguard, setWireguard] = useState(null);
    const [strongswan, setStrongSwan] = useState(null);

    const [healthhovered, setHealthhovered] = useState(false);
    const [statushovered, setStatushovered] = useState(false);
    const [serviceshovered, setServiceshovered] = useState(false);
    const [ovpnhovered, setOvpnhovered] = useState(false);
    const [wireguardHovered, setWireguardHovered] = useState(false);
    const [strongSwanHovered, setStrongSwanHovered] = useState(false);


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            const endpoints = {
                health: getMonitoringHealth,
                status: getMonitoringStatus,
                metrics: getMonitoringMetrics,
                alerts: getMonitoringAlerts,
                services: getMonitoredServices,
                ovpn: getOpenVPNService,
                wireguard: getWireGuardService,
                strongswan: getStrongSwanService,
            };

            const results = {};

            await Promise.all(
                Object.entries(endpoints).map(async ([key, apiFn]) => {
                    try {
                        const res = await apiFn();
                        results[key] = res?.data || {};
                    } catch (err) {
                        console.error(`Failed to fetch ${key}:`, err);
                        results[key] = { error: "Failed to load data" };
                    }
                })
            );

            // Update states individually
            setHealth(results.health || { status: "unknown" });
            setStatus(Array.isArray(results.status?.services) ? results.status.services : []);
            setMetrics(results.metrics || {});
            setAlerts(Array.isArray(results.alerts?.alerts) ? results.alerts.alerts : []);
            setServices(Array.isArray(results.services?.services) ? results.services.services : []);
            setOvpn(results.ovpn?.service || {});
            setWireguard(results.wireguard?.service || {});
            setStrongSwan(results.strongswan?.service || {});

            setLoading(false);
        };

        fetchData();
    }, []);


    if (loading)
        return (
            <div className="flex flex-col justify-center items-center h-[80vh]">
                <Loader2 className="h-10 w-10 animate-spin" />
                <span className="mt-4 text-xl font-semibold">Loading VPN Dashboard...</span>
            </div>
        );

    if (error)
        return (
            <div className="p-8 max-w-lg mx-auto mt-10 bg-red-50 border border-red-400 rounded-lg">
                <h2 className="flex items-center text-red-600 font-bold mb-2">
                    <AlertTriangle className="w-5 h-5 mr-2" />Error
                </h2>
                <p>{error}</p>
            </div>
        );

    // ✅ CHARTS CONFIGURATION

    // Health status
    const healthChart = {
        labels: ["Healthy", "Unhealthy"],
        datasets: [
            {
                data: [health.status === "healthy" ? 1 : 0, health.status === "healthy" ? 0 : 1],
                backgroundColor: ["#22c55e", "#ef4444"],
                hoverOffset: 4,
            },
        ],
    };

    // Service Status Donut
    const serviceStatusChart = {
        labels: ["active", "inactive"],
        datasets: [
            {
                data: [
                    status.filter((s) => s.status?.toLowerCase() === "active").length,
                    status.filter((s) => s.status?.toLowerCase() !== "active").length,
                ],
                backgroundColor: ["#22c55e", "#ef4444"],
                //     backgroundColor: ["#3B82F6", "#6B7280"],
                //  backgroundColor: ["#006B3C", "#A40000"],

                hoverOffset: 4,
            },
        ],
    };

    // Metrics Bar Chart
    const metricsChart = {
        labels: metrics.metrics?.map((m) => m.name) || [],
        datasets: [
            {
                label: "Metric Values",
                data: metrics.metrics?.map((m) => m.value) || [],
                backgroundColor: "#3b82f6", // blue
            },
        ],
    };

    // Services by Type Bar Chart
    const servicesByTypeChart = {
        labels: services.map((s) => s.name),
        datasets: [
            {
                label: "Service Type",
                data: services.map(() => 1), // simple count for each service
                backgroundColor: services.map((s) =>
                    s.enabled ? "#22c55e" : "#ef4444" // green if enabled, red if not
                ),
            },
        ],
    };
    // Alerts Bar Chart
    const alertChart = {
        labels: services.map((s) => s.service_name),
        datasets: [
            {
                label: "Alerts per Service",
                data: services.map((s) => alerts.filter((a) => a.service === s.service_name).length),
                backgroundColor: "#f43f5e",
            },
        ],
    };


    const renderServiceDetails = (service) => {
        if (!service) return null;

        return (
            <div className="shadow-xl rounded-xl p-4 mb-6 bg-white dark:bg-gray-800">
                <h3 className="font-semibold text-lg mb-4">{service.Name} ({service.Type})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem icon={<Database className="h-5 w-5 text-purple-500" />} label="Status" value={service.Status.toUpperCase()} />
                    <DetailItem icon={<Clock className="h-5 w-5 text-blue-500" />} label="Uptime (h)" value={((service.Uptime / 1e9) / 60 / 60).toFixed(2)} />
                    <DetailItem icon={<Users className="h-5 w-5 text-green-500" />} label="Connections" value={service.Connections} />
                    <DetailItem icon={<Activity className="h-5 w-5 text-red-500" />} label="PID" value={service.PID} />
                    <DetailItem icon={<Database className="h-5 w-5 text-indigo-500" />} label="Last Check" value={service.LastCheck} />
                    {/* <DetailItem icon={<BarChart className="h-5 w-5 text-gray-500" />} label="Config File" value={service.Config?.config_file || "N/A"} />
                    <DetailItem icon={<BarChart className="h-5 w-5 text-gray-500" />} label="Log File" value={service.Config?.log_file || "N/A"} />
                    <DetailItem icon={<BarChart className="h-5 w-5 text-gray-500" />} label="Status File" value={service.Config?.status_file || "N/A"} /> */}
                </div>
            </div>
        );
    };



    return (
        <div className=" h-screen overflow-y-auto p-8 space-y-6 ">
            <div className="max-w-7xl mx-auto">
                < h1 className="text-4xl font-extrabold mb-8 border-b pb-3" > VPN Monitoring Dashboard</h1 >

                {/* Top Metrics */}
                {/* < div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10" > */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10 relative">

                    {/* Health Metric Card with hover tooltip */}
                    <div
                        className="relative"
                        onMouseEnter={() => setHealthhovered(true)}
                        onMouseLeave={() => setHealthhovered(false)}
                    >
                        <MetricCard
                            icon={<Activity className="h-6 w-6 text-blue-500" />}
                            title="Monitoring Health"
                            value={health.status || "Unknown"}
                            subtext={`Version: ${health.version || "N/A"}`}
                        />
                        {/* Tooltip / Details box */}
                        {healthhovered && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                                <h4 className="font-semibold mb-2">Health Details</h4>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-blue-400 font-bold">✔</span>
                                    <span>Status: {health.status || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-blue-400 font-bold">✔</span>
                                    <span>Version: {health.version || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-400 font-bold">✔</span>
                                    <span>Timestamp: {health.timestamp || "N/A"}</span>
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Status Metric Card with hover tooltip  */}
                    <div
                        className="relative"
                        onMouseEnter={() => setStatushovered(true)}
                        onMouseLeave={() => setStatushovered(false)}
                    >
                        <MetricCard
                            icon={<Users className="h-6 w-6 text-blue-500" />}
                            title="Monitored Status (All VPN Services)"
                            value={`${status.filter(s => s.status?.toLowerCase() === "active").length} / ${status.length} Active`}
                            subtext={`Active: ${status
                                .filter(s => s.status?.toLowerCase() === "active")
                                .map(s => s.service_name)
                                .join(", ") || "N/A"
                                }`} />
                        {/* Tooltip / Details box */}
                        {statushovered && status.length > 0 && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                                <h4 className="font-semibold mb-2">Service Status Details:</h4>
                                {status.map((s) => (
                                    <div
                                        key={s.service_name}
                                        className={`flex flex-col gap-1 mb-2 p-2 rounded ${s.status?.toLowerCase() === "active" ? "bg-blue-900/30" : "bg-gray-700/30"}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={s.status?.toLowerCase() === "active" ? "text-green-400 font-bold" : "text-gray-400 font-bold"}>
                                                {s.status?.toLowerCase() === "active" ? "✔" : "✖"}
                                            </span>
                                            <span className={s.status?.toLowerCase() === "active" ? "text-green-400" : "text-gray-400"}>
                                                {s.service_name} ({s.status})
                                            </span>
                                        </div>
                                        <div className="text-sm ml-6">
                                            <div>Connections: {s.connections || 0}</div>
                                            <div>Uptime: {s.uptime || "0s"}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    <MetricCard
                        icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
                        title="Active Alerts"
                        value={alerts.length}
                        subtext="Current monitoring alerts"
                    />
                    {/* Services Metric Card with hover tooltip  */}
                    <div
                        className="relative inline-block"
                        onMouseEnter={() => setServiceshovered(true)}
                        onMouseLeave={() => setServiceshovered(false)}
                    >
                        <MetricCard
                            icon={<Users className="h-6 w-6 text-purple-500" />}
                            title="List Monitored Services"
                            value={services.length}
                            subtext={`Enabled: ${services.filter(s => s.enabled).length} | ${services.map(s => s.name).join(", ")}`}
                        />

                        {/* Tooltip / Details box */}
                        {serviceshovered && services.length > 0 && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                                <h4 className="font-semibold mb-2">Service Details:</h4>
                                {services.map((s) => (
                                    <div
                                        key={s.name}
                                        className="flex flex-col mb-2 p-2 rounded bg-gray-700/30"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{s.enabled ? "✔" : "✖"}</span>
                                            <span>{s.name}</span>
                                        </div>
                                        <div className="ml-6 text-sm">
                                            <div>Enabled: {s.enabled ? "Yes" : "No"}</div>
                                            <div>Type: {s.type || "N/A"}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>



                    <MetricCard
                        icon={<BarChart className="h-6 w-6 text-blue-500" />}
                        title="System Metrics"
                        value={metrics.length || "0"}
                        subtext={metrics.length ? "All collected monitoring metrics" : "No metrics available"}
                    />
                    {/* OVPN Metric Card with hover tooltip  */}
                    <div
                        className="relative inline-block"
                        onMouseEnter={() => setOvpnhovered(true)}
                        onMouseLeave={() => setOvpnhovered(false)}
                    >
                        <MetricCard
                            icon={<Database className="h-6 w-6 text-green-500" />}
                            title={`${ovpn.Name} Status`}
                            value={ovpn.Status.toUpperCase()}
                            subtext={`Connections: ${ovpn.Connections} | Uptime: ${(ovpn.Uptime / 1e9 / 60 / 60).toFixed(2)} h`}
                        />
                        {/* Tooltip / Details Box */}
                        {ovpnhovered && ovpn && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                                <h4 className="font-semibold mb-2">Details:</h4>
                                <div className="flex justify-between mb-1">
                                    <span className>Name:</span> <span>{ovpn.Name}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className>Status:</span> <span className={ovpn.Status.toLowerCase() === "active" ? "text-green-400" : "text-gray-400"}>{ovpn.Status}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className>Connections:</span> <span>{ovpn.Connections}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className>Uptime (h):</span> <span>{(ovpn.Uptime / 1e9 / 60 / 60).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className>Type:</span> <span>{ovpn.Type}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className="relative inline-block"
                        onMouseEnter={() => setWireguardHovered(true)}
                        onMouseLeave={() => setWireguardHovered(false)}
                    >
                        <MetricCard
                            icon={<Database className="h-6 w-6 text-blue-500" />}
                            title={`${wireguard.Name} Status`}
                            value={wireguard.Status.toUpperCase()}
                            subtext={`Connections: ${wireguard.Connections} | Uptime: ${(wireguard.Uptime / 1e9 / 60 / 60).toFixed(2)} h`}
                        />

                        {/* Tooltip / Details Box */}
                        {wireguardHovered && wireguard && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                                <h4 className="font-semibold mb-2">Details:</h4>
                                <div className="flex justify-between mb-1">
                                    <span>Name:</span> <span>{wireguard.Name}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span>Status:</span> <span className={wireguard.Status.toLowerCase() === "active" ? "text-green-400" : "text-gray-400"}>{wireguard.Status}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span>Connections:</span> <span>{wireguard.Connections}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span>Uptime (h):</span> <span>{(wireguard.Uptime / 1e9 / 60 / 60).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Type:</span> <span>{wireguard.Type}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className="relative inline-block"
                        onMouseEnter={() => setStrongSwanHovered(true)}
                        onMouseLeave={() => setStrongSwanHovered(false)}
                    >
                        <MetricCard
                            icon={<Database className="h-6 w-6 text-purple-500" />}
                            title={`${strongswan.Name} Status`}
                            value={strongswan.Status.toUpperCase()}
                            subtext={`Connections: ${strongswan.Connections} | Uptime: ${(strongswan.Uptime / 1e9 / 60 / 60).toFixed(2)} h`}
                        />

                        {/* Tooltip / Details Box */}
                        {strongSwanHovered && strongswan && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                                <h4 className="font-semibold mb-2">Details:</h4>
                                <div className="flex justify-between mb-1">
                                    <span>Name:</span> <span>{strongswan.Name}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span>Status:</span> <span className={strongswan.Status.toLowerCase() === "active" ? "text-green-400" : "text-gray-400"}>{strongswan.Status}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span>Connections:</span> <span>{strongswan.Connections}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span>Uptime (h):</span> <span>{(strongswan.Uptime / 1e9 / 60 / 60).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Type:</span> <span>{strongswan.Type}</span>
                                </div>
                            </div>
                        )}
                    </div>

                </div >
                {/* Charts */}
                < div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10" >

                    <div className="shadow-xl rounded-xl p-4 h-64 md:h-95 flex flex-col justify-center items-center">
                        <h3 className="font-semibold mb-4">Monitoring Health</h3>
                        {health.status?.toLowerCase() === "healthy" ? (
                            <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
                        ) : (
                            <XCircle className="h-16 w-16 text-red-500 mb-2" />
                        )}
                        <span className={`text-2xl font-bold ${health.status?.toLowerCase() === "healthy" ? "text-green-600" : "text-red-600"}`}>
                            {health.status ? health.status.toUpperCase() : "UNKNOWN"}
                        </span>
                    </div>





                    <div className="shadow-xl rounded-xl p-4 h-64 md:h-95">
                        <h3 className="font-semibold mb-2">Monitored Status</h3>
                        <Doughnut
                            data={serviceStatusChart}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                const index = context.dataIndex;
                                                const isActive = index === 0;
                                                const filtered = status.filter((s) =>
                                                    isActive
                                                        ? s.status?.toLowerCase() === "active"
                                                        : s.status?.toLowerCase() !== "active"
                                                );
                                                const serviceNames =
                                                    filtered.map((s) => s.service_name).join(", ") || "None";
                                                return `${context.label}: ${filtered.length} (${serviceNames})`;
                                            },
                                        },
                                    },
                                    legend: {
                                        position: "bottom",
                                    },
                                },
                            }}
                        />
                    </div>



                    <div className="shadow-xl rounded-xl p-24 h-64 md:h-95">
                        <h3 className="font-semibold mb-2">Alerts per Service</h3>
                        <Bar data={alertChart} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                        {/* Metrics Chart */}
                        {/* <div className="shadow-xl rounded-xl p-4 h-64 md:h-80">
                        <h3 className="font-semibold mb-2">System Metrics</h3>
                        <Bar data={metricsChart} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div> */}

                        {/* Services by Type */}
                        {/* <div className="shadow-xl rounded-xl p-4 h-64 md:h-80">
                        <h3 className="font-semibold mb-2">Services by Type</h3>
                        <Bar data={servicesByTypeChart} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div> */}
                    </div>

                </div >

                <h2 className="text-2xl font-bold mb-4 text-indigo-600">List Services</h2>
                <div className="shadow-xl rounded-xl overflow-x-auto">
                    <table className="w-full table-auto text-left border-collapse">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Type</th>
                                <th className="px-4 py-2">Enabled</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.length ? (
                                services.map((s, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">{s.name}</td>
                                        <td className="px-4 py-2">{s.type}</td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`px-2 py-1 rounded ${s.enabled ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                                                    }`}
                                            >
                                                {s.enabled ? "Enabled" : "Disabled"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-4 py-4 text-center">
                                        No services available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Alerts Table */}
                {/* <h2 className="text-2xl font-bold mt-10 mb-4 text-indigo-600">Monitoring Alerts</h2>
            <div className="shadow-xl rounded-xl overflow-x-auto">
                <table className="w-full table-auto text-left border-collapse">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="px-4 py-2">Service</th>
                            <th className="px-4 py-2">Alert</th>
                            <th className="px-4 py-2">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.length ? (
                            alerts.map((a, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">{a.service}</td>
                                    <td className="px-4 py-2">{a.message || "N/A"}</td>
                                    <td className="px-4 py-2">{a.timestamp}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-4 py-4 text-center">
                                    No alerts
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div> */}

                {/* System Metrics */}
                <h2 className="text-2xl font-bold mt-10 mb-4 text-indigo-600">System Metrics</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
                    <DetailItem icon={<Clock className="h-5 w-5 text-blue-500" />} label="Timestamp" value={metrics.timestamp || "N/A"} />
                    <DetailItem icon={<BarChart className="h-5 w-5 text-green-500" />} label="Metrics Count" value={metrics.metrics?.length || 0} />
                </div>
                <h2 className="text-2xl font-bold mt-10 mb-4 text-indigo-600">VPN Service Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderServiceDetails(ovpn)}
                    {renderServiceDetails(wireguard)}
                    {renderServiceDetails(strongswan)}
                </div>
            </div >
        </div>
    );
};

export default VpnDashboard;
