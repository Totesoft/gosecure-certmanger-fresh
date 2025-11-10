///animated vertical barchart for services enabled
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Card, CardContent, CardTitle } from "@totesoft/ui-kit";

interface ServicesResponse {
    service_name: string;
    type: string;
    enabled: boolean;
    services: {
        name: string;
        type: string;
        enabled: boolean;
    }[];
    timestamp: string;
}

export function AnimatedServiceChart() {
    const [servicesData, setServicesData] = useState<any[]>([]);
    const [visibleData, setVisibleData] = useState<any[]>([]);

    useEffect(() => {
        async function fetchServices() {
            try {
                const res = await fetch("/api/monitoring/services");
                const data: ServicesResponse = await res.json();

                const formatted = data.services.map((svc) => ({
                    name: svc.name,
                    enabled: svc.enabled ? 1 : 0,
                }));

                setServicesData(formatted);
            } catch (err) {
                console.error("Error fetching services:", err);
            }
        }
        fetchServices();
    }, []);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setVisibleData((prev) => [...servicesData.slice(0, i + 1)]);
            i++;
            if (i >= servicesData.length) clearInterval(interval);
        }, 150);
        return () => clearInterval(interval);
    }, [servicesData]);

    const greyPalette = ["#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb"];

    return (
        <Card className="mx-10 p-6 shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Service Enablement
            </CardTitle>
            <CardContent>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={visibleData}
                            margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} ticks={[0, 1]} domain={[0, 1]} />
                            <Tooltip formatter={(value: any) => (value === 1 ? "Enabled" : "Disabled")} />
                            <Bar dataKey="enabled">
                                {visibleData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            entry.enabled === 1
                                                ? greyPalette[index % greyPalette.length]
                                                : "#9ca3af"
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
