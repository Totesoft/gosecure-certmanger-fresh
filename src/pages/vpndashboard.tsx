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
import { AnimatedServiceChart } from "@/components/ui/AnimatedVertChart.tsx"
import ServiceConnectionsCard from "@/components/ui/ServiceConnectionsCard";
import { AnimatedServiceDots } from "@/components/ui/AnimatedServicesDots";
import ServiceStatusBadges from "@/components/ui/ServiceStatusBadges";
import ServiceDetailsTable from "@/components/ui/ServiceDetailsTable";
import SystemMetrics from "@/components/ui/SystemMetrics";
import AlertChart from "@/components/ui/AlertChart";
import HealthMetricCard from "@/components/ui/HealthMetricCard";
import StatusMetricCard from "@/components/ui/StatusMetricCard";
import AlertMetricsCard from "@/components/ui/AlertMetricsCard";
import ListServicesMetricCard from "@/components/ui/ListServicesMetricCard";
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
        <div className="flex flex-row gap-4 px-6 py-2 w-full overflow-x-auto">
            <div className="min-h-screen w-full flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-2 md:p-4">
                <div className="w-full max-w-7xl flex flex-col space-y-6">
                    {/* Dashboard Title */}
                    <h1 className="text-center text-blue-800 dark:text-blue-400 text-4xl font-extrabold border-b pb-4">
                        VPN Monitoring Dashboard
                    </h1>

                    {/* Search + Date Picker Row */}
                    <div className="flex flex-col md:flex-row justify-end items-center gap-3 w-full">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
                            <Input
                                type="text"
                                placeholder="Search ..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl text-base border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                            />
                        </div>
                        <div className="w-full md:w-72 mt-3 md:mt-0">
                            <DateRangePicker currentRange={dateRange} onChange={(range) => setDateRange(range)} />
                        </div>
                    </div>

                    {/* === Top Metrics Section === */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <HealthMetricCard health={health} />
                        <StatusMetricCard status={status} />
                        <AlertMetricsCard alerts={alerts} />
                        <ListServicesMetricCard services={services} />
                    </div>

                    {/* === Service Connections Section === */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                        <ServiceConnectionsCard data={{ service: ovpn, timestamp: ovpn?.timestamp }} />
                        <ServiceConnectionsCard data={{ service: wireguard, timestamp: wireguard?.timestamp }} />
                        <ServiceConnectionsCard data={{ service: strongswan, timestamp: strongswan?.timestamp }} />
                    </div>

                    {/* === Charts Section === */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
                        <div className="h-[380px]">
                            {status.length > 0 && (
                                <AnimatedChart
                                    title="Service Uptime (hours)"
                                    data={prepareChartData(status)}
                                    color="#6b7280"
                                    duration={2000}
                                />
                            )}
                        </div>
                        <div className="h-[380px]">
                            <AnimatedServiceDots />
                        </div>
                    </div>

                    {/* === Status Badges === */}
                    <div className="mt-6">
                        <ServiceStatusBadges status={status} />
                    </div>

                    {/* === Service Details Table === */}
                    <div className="mt-10">
                        <ServiceDetailsTable ovpn={ovpn} wireguard={wireguard} strongswan={strongswan} />
                    </div>

                    {/* === Metrics and Alerts Charts === */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
                        <SystemMetrics metrics={metrics} DetailItem={DetailItem} />
                        <AlertChart alertChart={alertChart} />
                    </div>
                </div>
            </div>
        </div>
    );

};

export default VpnDashboard;