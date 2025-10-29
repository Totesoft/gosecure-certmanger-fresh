
import React, { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { TrendingUp, TrendingDown, Search, Loader2, Users, AlertTriangle, Clock, BarChart, Database, Activity } from "lucide-react";
import { Doughnut, Bar } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
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
//import { Calendar } from "@/components/ui/calendar";
import { subDays, startOfMonth, endOfMonth, startOfYear, format } from "date-fns";
import DateRangePicker from "@/components/ui/DateRangePicker";
import "chartjs-adapter-date-fns";
import { AnimatedChart } from "@/components/ui/Animatedchart";
import type { start } from "repl";
import { AnimatedHorzChart, AnimatedServiceChart, ServicesEnabledChart } from "@/components/ui/AnimatedHorzChart.tsx"




// 1️⃣ /monitoring/health
interface HealthResponse {
    disk: any;
    cpu: any;
    memory: any;
    metrics: HealthResponse | null;
    status: string;        // "healthy"
    timestamp: number;     // Unix timestamp
    version: string;       // e.g. "1.0.0"
}

// 2️⃣ /monitoring/status
interface ServiceStatus {
    service_name: string;
    status: string;        // "active" | "inactive"
    pid: number;
    uptime: string;
    connections: number;
    total_connections: number;
    bytes_in: number;
    bytes_out: number;
    packets_in: number;
    packets_out: number;
    errors: number;
    last_error: string;
    version: string;
    config_file: string;
    log_file: string;
    timestamp: string;     // ISO 8601
}

interface MonitoringStatusResponse {
    agent: {
        id: string;
        name: string;
        uptime: string;
        version: string;
    };
    services: ServiceStatus[];
    timestamp: string;     // ISO 8601
}

// 3️⃣ /monitoring/metrics
interface MetricsResponse {
    metrics: any[];        // Empty array or structured metrics if available
    timestamp: string;
}

// 4️⃣ /monitoring/alerts
interface MonitoringAlert {
    level: any;
    service: string;
    id?: string;
    message?: string;
    severity?: string;     // e.g., "info" | "warning" | "critical"
    timestamp?: string;    // ISO 8601
}

interface MonitoringAlertsResponse {
    alerts: MonitoringAlert[];
    timestamp: string;
}

// 5️⃣ /monitoring/services
interface ServicesResponse {
    service_name: any;
    name: ReactNode;
    type: string;
    enabled: any;
    services: {
        config: {
            config_file?: string;
            log_file?: string;
            status_file?: string;
            interface?: string;
        };
        enabled: boolean;
        name: string;
        type: string;
    }[];
    timestamp: string;
}

// 6️⃣ /monitoring/services/openvpn
interface OpenVPNServiceResponse {
    service: {
        Name: string;
        Type: string;
        Status: string;
        PID: number;
        Uptime: number;
        Connections: number;
        LastCheck: string;
        Config: {
            config_file: string;
            log_file: string;
            status_file: string;
        };
    };
    timestamp: string;
}

// 7️⃣ /monitoring/services/wireguard
interface WireGuardServiceResponse {
    service: {
        Name: string;
        Type: string;
        Status: string;
        PID: number;
        Uptime: number;
        Connections: number;
        LastCheck: string;
        Config: {
            interface: string;
        };
    };
    timestamp: string;
}

// 8️⃣ /monitoring/services/strongswan
interface StrongSwanServiceResponse {
    service: {
        Name: string;
        Type: string;
        Status: string;
        PID: number;
        Uptime: number;
        Connections: number;
        LastCheck: string;
        Config: {
            config_file: string;
            log_file: string;
        };
    };
    timestamp: string;
}

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
const DetailItem = ({
    icon,
    label,
    value,
}: {
    icon?: React.ReactNode;
    label: string;
    value?: string | number | null;
}) => (
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
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [status, setStatus] = useState<ServiceStatus[]>([]);
    const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
    const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
    const [services, setServices] = useState<ServicesResponse[]>([]);
    const [ovpn, setOvpn] = useState<OpenVPNServiceResponse | null>(null);
    const [wireguard, setWireguard] = useState<WireGuardServiceResponse | null>(null);
    const [strongswan, setStrongSwan] = useState<StrongSwanServiceResponse | null>(null);
    const [healthhovered, setHealthhovered] = useState(false);
    const [statushovered, setStatushovered] = useState(false);
    const [serviceshovered, setServiceshovered] = useState(false);
    const [alertshovered, setAlertshovered] = useState(false);
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: subDays(new Date(), 7),
        to: new Date(),
    });
    const [triggerFetch, setTriggerFetch] = useState(0);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const sampleData = [
        { name: "Mon", value: 30 },
        { name: "Tue", value: 45 },
        { name: "Wed", value: 32 },
        { name: "Thu", value: 50 },
        { name: "Fri", value: 42 },
        { name: "Sat", value: 60 },
        { name: "Sun", value: 38 },
    ];






    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Define endpoints
                const endpoints = {
                    health: getMonitoringHealth,
                    status: getMonitoringStatus,
                    metrics: () => getMonitoringMetrics(start, end),
                    alerts: () => getMonitoringAlerts(start, end),
                    services: getMonitoredServices,
                    ovpn: getOpenVPNService,
                    wireguard: getWireGuardService,
                    strongswan: getStrongSwanService,
                };
                //  const { start, end } = getDateRangeParams();
                const { from, to } = dateRange;
                console.log("Fetching data for:", from, to);

                // Use Promise.all for concurrent fetching
                const results: Record<string, any> = {};

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

                // Update states with proper fallbacks and types
                setHealth(results.health as HealthResponse);

                setStatus(
                    Array.isArray(results.status?.services)
                        ? (results.status.services as ServiceStatus[])
                        : []
                );

                setMetrics(results.metrics as MetricsResponse);

                setAlerts(
                    Array.isArray(results.alerts?.alerts)
                        ? (results.alerts.alerts as MonitoringAlert[])
                        : []
                );

                setServices(
                    Array.isArray(results.services?.services)
                        ? (results.services.services as ServicesResponse[])
                        : []
                );

                setOvpn(results.ovpn?.service as OpenVPNServiceResponse);
                setWireguard(results.wireguard?.service as WireGuardServiceResponse);
                setStrongSwan(results.strongswan?.service as StrongSwanServiceResponse);
            } catch (err: any) {
                console.error("Unexpected error:", err);
                setError("Something went wrong while fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange]);


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


    //Status chart barchart

    // Convert uptime string like "346h58m2.848122145s" → total hours
    const convertToHours = (uptimeStr: string) => {
        if (!uptimeStr || uptimeStr === "0s") return 0;

        const hMatch = uptimeStr.match(/(\d+)h/);
        const mMatch = uptimeStr.match(/(\d+)m/);
        const sMatch = uptimeStr.match(/([\d.]+)s/);

        const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
        const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;
        const seconds = sMatch ? parseFloat(sMatch[1]) : 0;

        return hours + minutes / 60 + seconds / 3600;
    };
    const chartDData = {
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
                    label: function (context: { dataIndex: any; }) {
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



    // const convertToHours = (uptimeStr: string) => {
    //     if (!uptimeStr || uptimeStr === "0s") return 0;
    //     const h = uptimeStr.match(/(\d+)h/);
    //     const m = uptimeStr.match(/(\d+)m/);
    //     const s = uptimeStr.match(/([\d.]+)s/);
    //     return (
    //         (h ? parseInt(h[1]) : 0) +
    //         (m ? parseInt(m[1]) / 60 : 0) +
    //         (s ? parseFloat(s[1]) / 3600 : 0)
    //     );
    // };
    const prepareChartData = (services: ServiceStatus[]) => {
        return services.map(s => ({
            name: s.service_name,
            value: convertToHours(s.uptime),   // y-axis
            connections: s.connections,        // tooltip info
        }));
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



    console.log('servicestatus', status)
    console.log("serviceeee", services)

    const servicesEnabled = services.filter(s => s.enabled).length;
    const servicesDisabled = services.filter(s => !s.enabled).length;




    ///Return****
    return (
        <div className="flex flex-col min-h-screen">
            <div className="min-h-screen w-full flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-2 md:p-4">
                <div className="w-full max-w-6xl flex flex-col space-y-4">
                    <h1 className="text-center text-blue-800 dark:text-blue-400 text-4xl font-extrabold border-b pb-3">
                        VPN Monitoring Dashboard
                    </h1>
                    <div className="flex flex-col md:flex-row justify-end items-center gap-3 w-full">
                        {/* Search Input */}
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
                            <Input
                                type="text"
                                placeholder="Search ..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl text-base border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                            />
                        </div>

                        {/* Date Picker */}
                        <div className="w-full md:w-72 mt-3 md:mt-0">
                            <DateRangePicker
                                currentRange={dateRange}
                                onChange={(range) => setDateRange(range)}
                            />
                        </div>
                    </div>

                    {/* KPI Section */}
                    {/* <section className="mb-6">
                        <h2 className="text-2xl font-bold mb-3 text-indigo-600 dark:text-indigo-400">
                            Key Performance Indicators
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> */}
                    {/* 1️⃣ Service Status KPI */}
                    {/* <CircularMetricCard
                                title="Service Status"
                                value={
                                    status.length
                                        ? ((status.filter(s => s.status?.toLowerCase() === "active").length / status.length) * 100).toFixed(1)
                                        : 0
                                }
                                change={0}
                                color="#10b981" // green
                            /> */}


                    {/* 3️⃣ Error Rate */}
                    {/* <CircularMetricCard
                                title="Error Rate"
                                value={
                                    alerts.length
                                        ? ((alerts.filter(a => a.level?.toLowerCase() === "error").length / alerts.length) * 100).toFixed(1)
                                        : 0
                                }
                                change={0}
                                color="#ef4444" // red
                            /> */}

                    {/* 4️⃣ System Metrics (from /metrics or health API) */}
                    {/* <CircularMetricCard
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
                            /> */}
                    {/* 2️⃣ Total Services */}
                    {/* <CircularMetricCard
                                title="List Services"
                                value={services.length || 0}
                                change={0}
                                color="#3b82f6" // blue
                            /> */}



                    {/* </div>
                    </section> */}
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
                                        <span>Status: {health?.status || "N/A"}</span>
                                        <span>Version: {health?.version || "N/A"}</span>
                                        <span>Timestamp: {health?.timestamp || "N/A"}</span>
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

                    {/* < div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> */}
                    < div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10" >


                        <AnimatedServiceChart />

                        {/* Status Badge */}
                        {/* <Card className="shadow-xl rounded-xl border border-gray-100 p-4"> */}

                        <Card className="shadow-xl rounded-xl border border-gray-100 p-4 w-64 Soverflow-y-auto">
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

                                                <span
                                                    className="px-2 py-1 rounded text-sm text-white"
                                                    style={{
                                                        backgroundColor: isActive ? "#C0723D" : "#9ca3af", // #9ca3af ≈ gray-400
                                                    }}
                                                >
                                                    {isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-2 w-full bg-gray-200 rounded-full">
                                                <div
                                                    className={`${isActive ? "bg-gray-400" : "bg-gray-400"} h-full rounded-full transition-all`}
                                                    style={{
                                                        backgroundColor: isActive ? "#C0723D" : "#9ca3af", // gray-400 hex value
                                                        width: isActive ? "100%" : "40%",
                                                    }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>


                        <div className="w-[420px] h-[380px]">
                            {status.length > 0 && (
                                <AnimatedChart
                                    title="Service Uptime (hours)"
                                    data={prepareChartData(status)}
                                    color="#6b7280"
                                    duration={2000}
                                />
                            )}
                        </div>
                        {/* 2️⃣ Services Enabled KPI */}
                        {/* // Example: Services Enabled KPI Card */}
                        <CircularMetricCard
                            title="Services Enabled"
                            value={
                                services?.length
                                    ? (
                                        (services.filter(s => s.enabled).length /
                                            services.length) *
                                        100
                                    ).toFixed(1)
                                    : 0
                            }
                            change={0}
                            color="#C0723D" // brown ring fill color
                        />


                        {/* Status  Bar Chart */}
                        {/* 
                        <Card className="shadow-xl rounded-xl p-4 h-64 md:h-95 flex flex-col">
                            <h3 className="font-semibold mb-4 text-center">Service Status Metrics</h3>
                            <div className="flex-1">
                                <Bar
                                    data={chartDData}
                                    options={{
                                        ...chartOptions,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: { enabled: true },
                                        },
                                        scales: {
                                            x: {
                                                grid: { display: false },
                                            },
                                            y: {
                                                beginAtZero: true,
                                                grid: { color: "rgba(200, 200, 200, 0.2)" },
                                            },
                                        },
                                        elements: {
                                            bar: {
                                                borderRadius: {
                                                    topLeft: 10,
                                                    topRight: 10,
                                                    bottomLeft: 0,
                                                    bottomRight: 0,
                                                },
                                                borderSkipped: false, // ensures both top corners are rounded
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </Card> */}
                    </div >
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
                                                className="px-2 py-1 text-sm rounded text-white"
                                                style={{
                                                    backgroundColor:
                                                        vpn.Status?.toLowerCase() === "active" ? "#C0723D" : "#6b7280", // gray
                                                }}
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
