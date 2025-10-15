import React, { useState, useEffect } from "react";
import { Loader2, Users, AlertTriangle, Clock, BarChart, Database, Activity } from "lucide-react";
import { Doughnut, Bar } from "react-chartjs-2";
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
    <div className="shadow-lg border-t-4 border-t-primary p-4 rounded-xl hover:shadow-xl transition">
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [healthRes, statusRes, metricsRes, alertsRes, servicesRes] = await Promise.all([
                    getMonitoringHealth(),
                    getMonitoringStatus(),
                    getMonitoringMetrics(),
                    getMonitoringAlerts(),
                    getMonitoredServices(),
                ]);

                // ✅ Correct response parsing
                setHealth(healthRes?.data || { status: "unknown" });
                setStatus(statusRes?.data || {});
                setMetrics(metricsRes?.data || {});
                setAlerts(Array.isArray(alertsRes?.data?.alerts) ? alertsRes.data.alerts : alertsRes?.data?.alerts || []);
                setServices(Array.isArray(statusRes?.data?.services) ? statusRes.data.services : []);
            } catch (err) {
                console.error(err);
                setError("Failed to load VPN monitoring data.");
            } finally {
                setLoading(false);
            }
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

    // Health Donut
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
        labels: ["Active", "Inactive"],
        datasets: [
            {
                data: [
                    services.filter((s) => s.status?.toLowerCase() === "active").length,
                    services.filter((s) => s.status?.toLowerCase() !== "active").length,
                ],
                backgroundColor: ["#22c55e", "#ef4444"],
                hoverOffset: 4,
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

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-4xl font-extrabold mb-8 border-b pb-3">VPN Monitoring Dashboard</h1>

            {/* Top Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
                <MetricCard
                    icon={<Activity className="h-6 w-6 text-green-500" />}
                    title="System Health"
                    value={health.status || "Unknown"}
                    subtext={`Version: ${health.version || "N/A"}`}
                />
                <MetricCard
                    icon={<Users className="h-6 w-6 text-blue-500" />}
                    title="Active Services"
                    value={services.filter((s) => s.status?.toLowerCase() === "active").length}
                    subtext="Currently running"
                />
                <MetricCard
                    icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
                    title="Active Alerts"
                    value={alerts.length}
                    subtext="Current monitoring alerts"
                />
                <MetricCard
                    icon={<Database className="h-6 w-6 text-purple-500" />}
                    title="Total Services"
                    value={services.length}
                    subtext="All monitored VPN services"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="shadow-xl rounded-xl p-4 h-64 md:h-80">
                    <h3 className="font-semibold mb-2">System Health</h3>
                    <Doughnut data={healthChart} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
                <div className="shadow-xl rounded-xl p-4 h-64 md:h-80">
                    <h3 className="font-semibold mb-2">Service Status</h3>
                    <Doughnut data={serviceStatusChart} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
                <div className="shadow-xl rounded-xl p-4 h-64 md:h-80">
                    <h3 className="font-semibold mb-2">Alerts per Service</h3>
                    <Bar data={alertChart} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
            </div>

            {/* Services Table */}
            <h2 className="text-2xl font-bold mb-4 text-indigo-600">Services Status</h2>
            <div className="shadow-xl rounded-xl overflow-x-auto">
                <table className="w-full table-auto text-left border-collapse">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="px-4 py-2">Service Name</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Version</th>
                            <th className="px-4 py-2">Uptime</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.length ? (
                            services.map((s, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">{s.service_name}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded ${getStatusBadge(s.status)}`}>{s.status}</span>
                                    </td>
                                    <td className="px-4 py-2">{s.version || "N/A"}</td>
                                    <td className="px-4 py-2">{s.uptime}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-4 py-4 text-center">
                                    No services available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Alerts Table */}
            <h2 className="text-2xl font-bold mt-10 mb-4 text-indigo-600">Monitoring Alerts</h2>
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
            </div>

            {/* System Metrics */}
            <h2 className="text-2xl font-bold mt-10 mb-4 text-indigo-600">System Metrics</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
                <DetailItem icon={<Clock className="h-5 w-5 text-blue-500" />} label="Timestamp" value={metrics.timestamp || "N/A"} />
                <DetailItem icon={<BarChart className="h-5 w-5 text-green-500" />} label="Metrics Count" value={metrics.metrics?.length || 0} />
            </div>
        </div>
    );
};

export default VpnDashboard;
