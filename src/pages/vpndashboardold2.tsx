
import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Search, Loader2, Users, AlertTriangle, Clock, BarChart, Database, Activity } from "lucide-react";
import { Doughnut, Bar } from "react-chartjs-2";
import { CheckCircle, XCircle } from "lucide-react"; // import icons
import CircularMetricCard from "@/components/ui/CircularMetricCard";
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
import { Input, Badge, Card, CardHeader, CardTitle, CardContent, CardDescription, Alert, AlertDescription, AlertTitle } from "@totesoft/ui-kit"
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

const MetricCard = ({ icon, title, value, subtext, className = "" }) => (
    <div
        className={`bg-white dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700 
                text-gray-900 dark:text-gray-100 
                rounded-xl p-4 shadow-md 
                hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                ${className}`}
    >
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold uppercase text-sm">{title}</h3>
            {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">{subtext}</p>
    </div>
);

const DetailItem = ({ icon, label, value }) => (
    <div
        className="flex items-start space-x-3 p-3 rounded-lg 
               bg-white dark:bg-gray-800 
               border border-gray-200 dark:border-gray-700 
               shadow-sm hover:shadow-md transition-all duration-300"
    >
        <div className="pt-1 text-gray-600 dark:text-gray-300">{icon}</div>
        <div>
            <p className="text-sm font-medium uppercase text-gray-700 dark:text-gray-400">{label}</p>
            <p className="font-bold text-gray-900 dark:text-gray-100">{value ?? "N/A"}</p>
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
    const [alertshovered, setAlertshovered] = useState(false);



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
            <div className="flex flex-col justify-center items-center">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                <span className="mt-4 text-xl font-medium">Loading Dashboard Data...</span>
            </div>
        );
    if (error)
        return (
            <div className="p-8 max-w-xl mx-auto mt-20 rounded-xl shadow-2xl">
                <Alert className="border-red-500 bg-red-50 text-red-800">
                    <AlertTitle className="flex items-center text-xl font-bold">
                        <AlertTriangle className="w-6 h-6 mr-3" /> System Error
                    </AlertTitle>
                    <AlertDescription className="text-base mt-2">{error}</AlertDescription>
                </Alert>
            </div>
        );


    // ✅ CHARTS CONFIGURATION


    // Service Status Donut
    const serviceStatusChart = {
        labels: ["active", "inactive"],
        datasets: [
            {
                data: [
                    status.filter((s) => s.status?.toLowerCase() === "active").length,
                    status.filter((s) => s.status?.toLowerCase() !== "active").length,
                ],
                // backgroundColor: ["#22c55e", "#ef4444"],
                //backgroundColor: ["#5c9660", "#de5d3e"],
                backgroundColor: ["#3e99de", "#555f66"],
                hoverOffset: 4,

            },
        ],
    };
    //Status chart barchart

    // Convert uptime string like "346h58m2.848122145s" → total hours
    const convertToHours = (uptimeStr) => {
        if (!uptimeStr || uptimeStr === "0s") return 0;

        const hMatch = uptimeStr.match(/(\d+)h/);
        const mMatch = uptimeStr.match(/(\d+)m/);
        const sMatch = uptimeStr.match(/([\d.]+)s/);

        const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
        const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;
        const seconds = sMatch ? parseFloat(sMatch[1]) : 0;

        return hours + minutes / 60 + seconds / 3600;
    };
    const chartData = {
        labels: status.map((s) => s.service_name),
        datasets: [
            {
                label: "Uptime (hours)",
                data: status.map((s) => convertToHours(s.uptime)),
                backgroundColor: "#3CB371",
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "bottom" },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const index = context.dataIndex;
                        const service = status[index];
                        const uptime = convertToHours(service.uptime).toFixed(2);
                        const connections = service.connections || 0;
                        return `Uptime: ${uptime} h | Connections: ${connections}`;
                    },
                },
            },
        },
        scales: {
            x: {
                stacked: false, // not stacking
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Uptime (hours)",
                },
            },
        },
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
    // Alerts Bar Chart (placeholder)
    const alertChart = {
        labels: services.map((s) => s.service_name), // X-axis
        datasets: [
            {
                label: "Alerts per Service",
                data: services.map(() => 0), // Y-axis = 0
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

    const activeServices = status.filter(s => s.status === "active").length;
    const totalServices = status.length;

    return (


        <div className="flex flex-col min-h-screen">
            <div className="min-h-screen w-full flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-2 md:p-4">
                <div className="w-full max-w-6xl flex flex-col space-y-4">
                    <h1 className="text-center text-blue-800 dark:text-blue-400 text-4xl font-extrabold border-b pb-3">
                        VPN Monitoring Dashboard
                    </h1>
                    <div className="flex justify-end items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
                            <input
                                type="text"
                                placeholder="Search for a command..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl text-base border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                            />
                        </div>
                    </div>




                    {/* KPI Section */}
                    <section className="mb-6">
                        <h2 className="text-2xl font-bold mb-3 text-indigo-600 dark:text-indigo-400">
                            Key Performance Indicators
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* 1️⃣ Service Status KPI */}
                            <CircularMetricCard
                                title="Service Status"
                                value={
                                    status.length
                                        ? ((status.filter(s => s.status?.toLowerCase() === "active").length / status.length) * 100).toFixed(1)
                                        : 0
                                }
                                change={0}
                                color="#10b981" // green
                            />

                            {/* 2️⃣ Total Services */}
                            <CircularMetricCard
                                title="List Services"
                                value={services.length || 0}
                                change={0}
                                color="#3b82f6" // blue
                            />

                            {/* 3️⃣ Error Rate */}
                            <CircularMetricCard
                                title="Error Rate"
                                value={
                                    alerts.length
                                        ? ((alerts.filter(a => a.level?.toLowerCase() === "error").length / alerts.length) * 100).toFixed(1)
                                        : 0
                                }
                                change={0}
                                color="#ef4444" // red
                            />

                            {/* 4️⃣ System Metrics (from /metrics or health API) */}
                            <CircularMetricCard
                                title="System Metrics"
                                value={
                                    health && health.metrics
                                        ? (
                                            (health.metrics.cpu + health.metrics.memory + health.metrics.disk) /
                                            3
                                        ).toFixed(1)
                                        : 0
                                }
                                change={0}
                                color="#facc15" // yellow for system load
                            />
                        </div>
                    </section>




                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10 relative">



                        <div
                            className="relative"
                            onMouseEnter={() => setHealthhovered(true)}
                            onMouseLeave={() => setHealthhovered(false)}
                        >
                            <Card className="mb-4">
                                <CardHeader className="flex items-center ">
                                    <CardTitle className="flex items-center gap-2">
                                        Monitoring Health
                                        <Activity className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        {/* Status Badge */}
                                        <span>
                                            {health ? (
                                                <Badge className={`px-2 py-1 rounded ${health.status?.toLowerCase() === "healthy" ? "bg-green-600" : "bg-red-600"} text-white`}>
                                                    {health.status}
                                                </Badge>
                                            ) : (
                                                "-"
                                            )}
                                        </span>

                                        {/* Version */}
                                        <div>Version: {health?.version ?? '-'}</div>
                                    </div>
                                </CardContent>
                            </Card>
                            {healthhovered && (
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">                                    <h4 className="font-semibold mb-2">Health Details</h4>
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

                            {/* 
<Card className="mb-4">
    <CardHeader className="flex items-center">
        <CardTitle className="flex items-center gap-2">
            Monitored Status (All VPN Services)
            <Users className="h-6 w-6 text-blue-500" />
        </CardTitle>
    </CardHeader>

    <CardContent>
        <div className="flex items-center justify-between">
           
                            <div>
                                <Badge className="bg-green-600 text-white px-2 py-1 rounded">
                                    {`${status.filter(s => s.status?.toLowerCase() === "active").length} / ${status.length} Active`}
                                </Badge>
                            </div>

                           
                            <div className="text-sm text-gray-600 dark:text-gray-300 text-right">
                                Active:{" "}
                                {status
                                    .filter(s => s.status?.toLowerCase() === "active")
                                    .map(s => s.service_name)
                                    .join(", ") || "N/A"}
                            </div>
                        </div>
                    </CardContent>
                </Card> */}


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

                        {/* Alerts Card with hover tooltip */}
                        <div
                            className="relative inline-block"
                            onMouseEnter={() => setAlertshovered(true)}
                            onMouseLeave={() => setAlertshovered(false)}
                        >
                            <Card className="mb-4">
                                <CardHeader className="flex items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        Active Alerts
                                        <AlertTriangle className="h-6 w-6 text-red-500" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        {/* Alert Count Badge */}
                                        <Badge
                                            className={`px-2 py-1 rounded ${alerts.length > 0 ? "bg-red-600 text-white" : "bg-green-600 text-white"
                                                }`}
                                        >
                                            {alerts.length > 0 ? `${alerts.length} Active` : "No Alerts"}
                                        </Badge>

                                        {/* Subtext */}
                                        <div className="text-sm text-gray-600 dark:text-gray-300 text-right">
                                            Current monitoring alerts
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tooltip / Details box */}
                            {alertshovered && alerts.length > 0 && (
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                                    <h4 className="font-semibold mb-2">Alert Details:</h4>
                                    {alerts.map((a, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col gap-1 mb-2 p-2 rounded bg-red-900/30"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-red-400 font-bold">⚠</span>
                                                <span>{a.message || "Unknown Alert"}</span>
                                            </div>
                                            <div className="text-sm ml-6">
                                                <div>Service: {a.service || "N/A"}</div>
                                                <div>Severity: {a.severity || "N/A"}</div>
                                                <div>Time: {a.timestamp || "N/A"}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Show a simple hover box when there are no alerts */}
                            {alertshovered && alerts.length === 0 && (
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-center">
                                    <p className="text-sm ml-6">All systems healthy — no active alerts.</p>
                                </div>
                            )}
                        </div>




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




                    </div >
                    {/* Charts************************ */}
                    {/* //////Monitoring Health CheckCircle//// */}
                    < div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10" >

                        {/* <div className="shadow-xl rounded-xl p-4 h-64 md:h-95 flex flex-col justify-center items-center">
                            <h3 className="font-semibold mb-4">Monitoring Health</h3>
                            {health.status?.toLowerCase() === "healthy" ? (
                                <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
                            ) : (
                                <XCircle className="h-16 w-16 text-red-500 mb-2" />
                            )}
                            <span className={`text-2xl font-bold ${health.status?.toLowerCase() === "healthy" ? "text-green-600" : "text-red-600"}`}>
                                {health.status ? health.status.toUpperCase() : "UNKNOWN"}
                            </span>
                        </div> */}








                        {/* /////Status Donut////// */}

                        {/* <div className="shadow-xl rounded-xl p-4 h-64 md:h-96">
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
 */}



                        {/* Status Badge */}
                        <Card className="shadow-xl rounded-xl border border-gray-100 p-4">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">Service Status</CardTitle>
                                <CardDescription className="text-md">
                                    {status.filter(s => s.status?.toLowerCase() === "active").length} of {status.length} Services Active
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {status.map((service, i) => {
                                    const isActive = service.status?.toLowerCase() === "active";

                                    return (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">{service.service_name}</span>
                                                <span className="flex items-center gap-1">

                                                    <span
                                                        className={`px-2 py-1 rounded text-sm ${isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                                                            }`}
                                                    >
                                                        {isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-2 w-full bg-gray-200 rounded-full">
                                                <div
                                                    className={`${isActive ? "bg-green-500" : "bg-gray-400"} h-full rounded-full transition-all`}
                                                    style={{ width: isActive ? "100%" : "40%" }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>


                        {/* Status  Bar Chart */}

                        <Card className="shadow-xl rounded-xl p-4 h-64 md:h-95 flex flex-col">
                            <h3 className="font-semibold mb-4 text-center">Service Status Metrics</h3>
                            <div className="flex-1">
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </Card>
                    </div >

                    {/* List Services */}
                    {/* <Card className="grid grid-cols-1 gap-6 mb-10 p-6">
                        <h2 className="text-2xl font-bold mb-4 text-indigo-600">List Services</h2>

                        {services.length ? (
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {services.map((service, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-all duration-200 shadow-sm cursor-default
            ${service.enabled
                                                ? "bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-blue-500 hover:to-blue-700"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                                            }
          `}
                                    >
                                        {service.enabled ? (
                                            <span className="text-white">✔</span>
                                        ) : (
                                            <span className="text-gray-500 dark:text-gray-300">✖</span>
                                        )}
                                        <span className="font-medium">{service.name}</span>
                                        <span className="text-sm opacity-80">{service.enabled ? "Enabled" : "Disabled"}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-gray-500 w-full text-center">No services available</span>
                        )}
                    </Card> */}



                    {/* Services Table */}
                    <h2 className="text-2xl font-bold mt-10 mb-4 text-indigo-600 dark:text-indigo-400">
                        VPN Service Details
                    </h2>

                    <div className="shadow-xl rounded-xl p-6 bg-white dark:bg-gray-800 overflow-x-auto transition-colors duration-300">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-indigo-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <th className="px-4 py-3 text-left font-semibold">Service</th>
                                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Uptime (h)</th>
                                    <th className="px-4 py-3 text-left font-semibold">Connections</th>
                                    <th className="px-4 py-3 text-left font-semibold">PID</th>
                                    <th className="px-4 py-3 text-left font-semibold">Last Check</th>
                                </tr>
                            </thead>

                            <tbody>
                                {[ovpn, wireguard, strongswan].filter(Boolean).map((vpn, i) => (
                                    <tr
                                        key={i}
                                        className={`border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 ${vpn.Status?.toLowerCase() === "active"
                                            ? "bg-blue-50 dark:bg-blue-900/20"
                                            : "bg-gray-50 dark:bg-gray-900/30"
                                            }`}
                                    >
                                        <td className="px-4 py-3 font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                            {vpn.Name}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{vpn.Type}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 text-sm rounded text-white ${vpn.Status?.toLowerCase() === "active"
                                                    ? "bg-blue-600"
                                                    : "bg-gray-500"
                                                    }`}
                                            >
                                                {vpn.Status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                                            {((vpn.Uptime / 1e9) / 60 / 60).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                                            {vpn.Connections}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{vpn.PID}</td>
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{vpn.LastCheck}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>








                    {/* Service Details Card */}
                    {/* 
                    <h2 className="text-2xl font-bold mt-10 mb-4 text-indigo-600">VPN Service Details</h2>
                    <div className="shadow-xl rounded-xl p-6 bg-white dark:bg-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {ovpn && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">{ovpn.Name} ({ovpn.Type})</h3>
                                    <DetailItem icon={<Database className="h-5 w-5 text-purple-500" />} label="Status" value={ovpn.Status.toUpperCase()} />
                                    <DetailItem icon={<Clock className="h-5 w-5 text-blue-500" />} label="Uptime (h)" value={((ovpn.Uptime / 1e9) / 60 / 60).toFixed(2)} />
                                    <DetailItem icon={<Users className="h-5 w-5 text-green-500" />} label="Connections" value={ovpn.Connections} />
                                    <DetailItem icon={<Activity className="h-5 w-5 text-red-500" />} label="PID" value={ovpn.PID} />
                                    <DetailItem icon={<Database className="h-5 w-5 text-indigo-500" />} label="Last Check" value={ovpn.LastCheck} />
                                </div>
                            )}

                            {wireguard && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">{wireguard.Name} ({wireguard.Type})</h3>
                                    <DetailItem icon={<Database className="h-5 w-5 text-purple-500" />} label="Status" value={wireguard.Status.toUpperCase()} />
                                    <DetailItem icon={<Clock className="h-5 w-5 text-blue-500" />} label="Uptime (h)" value={((wireguard.Uptime / 1e9) / 60 / 60).toFixed(2)} />
                                    <DetailItem icon={<Users className="h-5 w-5 text-green-500" />} label="Connections" value={wireguard.Connections} />
                                    <DetailItem icon={<Activity className="h-5 w-5 text-red-500" />} label="PID" value={wireguard.PID} />
                                    <DetailItem icon={<Database className="h-5 w-5 text-indigo-500" />} label="Last Check" value={wireguard.LastCheck} />
                                </div>
                            )}

                            {strongswan && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">{strongswan.Name} ({strongswan.Type})</h3>
                                    <DetailItem icon={<Database className="h-5 w-5 text-purple-500" />} label="Status" value={strongswan.Status.toUpperCase()} />
                                    <DetailItem icon={<Clock className="h-5 w-5 text-blue-500" />} label="Uptime (h)" value={((strongswan.Uptime / 1e9) / 60 / 60).toFixed(2)} />
                                    <DetailItem icon={<Users className="h-5 w-5 text-green-500" />} label="Connections" value={strongswan.Connections} />
                                    <DetailItem icon={<Activity className="h-5 w-5 text-red-500" />} label="PID" value={strongswan.PID} />
                                    <DetailItem icon={<Database className="h-5 w-5 text-indigo-500" />} label="Last Check" value={strongswan.LastCheck} />
                                </div>
                            )}
                        </div>
                    </div> */}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6h-64 md:h-96 mb-10">
                        {/* System Metrics */}
                        <Card className="shadow-xl rounded-xl p-4 h-64 md:h-95 flex flex-col">                            <h2 className="text-2xl font-bold mb-4 text-indigo-600">System Metrics</h2>
                            {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"> */}
                            <DetailItem icon={<Clock className="h-5 w-5 text-blue-500" />} label="Timestamp" value={metrics.timestamp || "N/A"} />
                            <DetailItem icon={<BarChart className="h-5 w-5 text-green-500" />} label="Metrics Count" value={metrics.metrics?.length || 0} />
                            {/* </div> */}
                        </Card>


                        {/* Alerts per Service */}
                        <Card className="shadow-xl rounded-xl p-4 h-64 md:h-95 flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold mb-4 text-indigo-600">Alerts per Service</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="h-full w-full">
                                    <Bar
                                        data={alertChart}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: true, position: "top" },
                                            },
                                            scales: {
                                                x: {
                                                    ticks: {
                                                        autoSkip: false,       // ensure all labels show
                                                        maxRotation: 45,       // rotate labels if long
                                                        minRotation: 0,
                                                        font: { size: 10 },    // smaller font for long names
                                                    },
                                                    title: {
                                                        display: true,
                                                        text: "Services",      // label for x-axis
                                                        font: { weight: "bold" },
                                                    },
                                                },
                                                y: {
                                                    beginAtZero: true,
                                                    stepSize: 1,
                                                    title: {
                                                        display: true,
                                                        text: "Number of Alerts", // label for y-axis
                                                        font: { weight: "bold" },
                                                    },
                                                },
                                            },
                                        }}
                                        className="h-full w-full"
                                    />
                                </div>
                            </CardContent>
                        </Card>


                    </div>






                </div >
            </div >
        </div >

    );
};

export default VpnDashboard;
