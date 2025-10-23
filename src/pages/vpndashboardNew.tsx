import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@totesoft/ui-kit";
import { Button } from "@totesoft/ui-kit";
import { Badge } from "@totesoft/ui-kit";

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Loader2,
    AlertTriangle,
    RefreshCw,
    Search,
    FileText,
    File,
    FileUp,
    CheckCircle,
    XCircle,
    CalendarIcon,
    Server,
    Database,
} from "lucide-react";
//import { Calendar } from "@/components/ui/calendar";
//import { subDays, startOfMonth, endOfMonth, startOfYear, format } from "date-fns";
import { cn } from "@/lib/utils";
import CircularMetricCard from "@/components/ui/CircularMetricCard";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API_BASE = "https://pre-prod.be.anchorvpn.net/api/v1/monitoring";

export default function VPNDashboard() {
    const [health, setHealth] = useState(null);
    const [status, setStatus] = useState(null);
    const [polling, setPolling] = useState(true);
    const [lastError, setLastError] = useState(null);

    const pollInterval = 5000;

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            try {
                const [h, s] = await Promise.all([
                    axios.get(`${API_BASE}/health`),
                    axios.get(`${API_BASE}/status`),
                ]);
                if (!mounted) return;
                setHealth(h.data);
                setStatus(s.data);
            } catch (err) {
                setLastError(err.message ?? 'fetch error');
            }
        }

        fetchData();
        if (!polling) return () => mounted = false;

        const intervalId = setInterval(fetchData, pollInterval);
        return () => {
            mounted = false;
            clearInterval(intervalId);
        };
    }, [polling]);

    const totals = status?.services?.reduce((acc, s) => {
        acc.connections += s.connections ?? 0;
        acc.bytesIn += s.bytes_in ?? 0;
        acc.bytesOut += s.bytes_out ?? 0;
        return acc;
    }, { connections: 0, bytesIn: 0, bytesOut: 0 }) ?? { connections: 0, bytesIn: 0, bytesOut: 0 };

    const barData = {
        labels: status?.services.map(s => s.service_name) ?? [],
        datasets: [
            {
                label: 'Connections',
                data: status?.services.map(s => s.connections) ?? [],
                backgroundColor: ['#8884d8', '#82ca9d', '#ff7300'],
            },
            {
                label: 'Total Connections',
                data: status?.services.map(s => s.total_connections) ?? [],
                backgroundColor: ['#a29bfe', '#55efc4', '#fdcb6e'],
            }
        ]
    };

    const doughnutData = {
        labels: ['OpenVPN', 'WireGuard', 'StrongSwan'],
        datasets: [{
            label: 'Active vs Inactive',
            data: status?.services.map(s => s.status === 'active' ? 1 : 0) ?? [0, 0, 0],
            backgroundColor: ['#00b894', '#d63031', '#0984e3'],
            hoverOffset: 10
        }]
    };

    return (

        <div className="p-6 max-w-full">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl font-extrabold">VPN Monitoring</h1>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
                        <input
                            type="text"
                            placeholder="Search for a command..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl text-base border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        />
                    </div>
                    {/* <DateRangePicker
                        currentRange={dateRange}
                        onChange={(range) => {
                            setDateRange(range);
                            setTriggerFetch((prev) => prev + 1);
                        }}
                    />
                    <Button
                        variant="outline"
                        onClick={() => {
                            setAutoRefresh(!autoRefresh);
                            if (!autoRefresh) fetchData();
                        }}
                        className={cn(
                            "h-10 w-10 p-0 transition-all duration-200 border-gray-300 shadow-sm rounded-lg",
                            autoRefresh ? "bg-blue-500 text-white hover:bg-blue-600" : ""
                        )}
                        title={autoRefresh ? "Auto-Refresh On (180s)" : "Click to enable Auto-Refresh (180s)"}
                    >
                        <RefreshCw className={cn("h-5 w-5", autoRefresh ? "animate-spin" : "")} />
                    </Button>*/}


                </div>
            </header>






            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">AnchorVPN — Monitoring Dashboard</h1>
                <Button size="sm" variant={polling ? 'destructive' : 'secondary'} onClick={() => setPolling(p => !p)}>
                    {polling ? 'Stop Polling' : 'Start Polling'}
                </Button>
            </div>

            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-4">
                    <Card className="mb-4">
                        <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div>Status: {health ? <Badge className="bg-green-600">{health.status}</Badge> : '-'}</div>
                                    <div>Version: {health?.version ?? '-'}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>Connections<br /><span className="font-semibold">{totals.connections}</span></div>
                                <div>Bytes In<br /><span className="font-semibold">{totals.bytesIn}</span></div>
                                <div>Bytes Out<br /><span className="font-semibold">{totals.bytesOut}</span></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-12 lg:col-span-8 space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Connections per Service (Bar Chart)</CardTitle></CardHeader>
                        <CardContent>
                            <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Service Connections' } } }} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Active Services (Donut Chart)</CardTitle></CardHeader>
                        <CardContent>
                            <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'right' }, title: { display: true, text: 'Active vs Inactive' } } }} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {lastError && <div className="mt-6 text-sm text-red-600">Error: {lastError}</div>}
        </div>
    );
}
