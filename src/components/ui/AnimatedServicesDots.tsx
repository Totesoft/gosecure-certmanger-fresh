"use client";
import { useEffect, useState } from "react";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { Card, CardContent, CardTitle } from "@totesoft/ui-kit";

export function AnimatedServiceDots() {
    const [servicesData, setServicesData] = useState<any[]>([]);
    const [visibleData, setVisibleData] = useState<any[]>([]);

    useEffect(() => {
        async function fetchServices() {
            try {
                const res = await fetch("/api/monitoring/services");
                const results = await res.json();

                const formatted = (results.services || []).map((svc: any, i: number) => ({
                    x: i + 1,
                    y: svc.enabled ? 1 : 0,
                    name: svc.name,
                    type: svc.type,
                    enabled: svc.enabled,
                }));

                setServicesData(formatted);
            } catch (err) {
                console.error("Error fetching services:", err);
            }
        }

        fetchServices();
    }, []);

    useEffect(() => {
        if (!servicesData.length) return;
        let i = 0;
        const interval = setInterval(() => {
            setVisibleData(servicesData.slice(0, i + 1));
            i++;
            if (i >= servicesData.length) clearInterval(interval);
        }, 250);
        return () => clearInterval(interval);
    }, [servicesData]);

    const bluePalette = ["#60a5fa", "#93c5fd", "#bfdbfe"];
    const hasData = visibleData.length > 0;

    return (
        <Card className="p-6 shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full flex flex-col">
            <CardTitle className="text-2xl font-bold text-blue-800 dark:text-blue-400">
                Services Enabled
            </CardTitle>

            <CardContent className="flex-1">
                {/* Fixed height container */}
                <div className="w-full h-[380px]">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="x"
                                    tickFormatter={(v) => visibleData[v - 1]?.name || ""}
                                    label={{
                                        value: "Service",
                                        position: "insideBottom",
                                        offset: -5,
                                    }}
                                />
                                <YAxis
                                    dataKey="y"
                                    ticks={[0, 1]}
                                    domain={[0, 1]}
                                    label={{
                                        value: "Enabled",
                                        angle: -90,
                                        position: "insideLeft",
                                        offset: 10,
                                    }}
                                />
                                <Tooltip
                                    formatter={(value: any, name: any, props: any) =>
                                        props.payload.enabled ? "Enabled" : "Disabled"
                                    }
                                    labelFormatter={(label: any) =>
                                        visibleData[label - 1]?.name || ""
                                    }
                                />
                                <Scatter data={visibleData} shape="circle">
                                    {visibleData.map((entry, index) => (
                                        <circle
                                            key={index}
                                            cx={entry.x * 80}
                                            cy={entry.y === 1 ? 50 : 150}
                                            r={10}
                                            fill={
                                                entry.enabled
                                                    ? bluePalette[index % bluePalette.length]
                                                    : "#60a5fa"
                                            }
                                        >
                                            <animate
                                                attributeName="r"
                                                from="0"
                                                to="10"
                                                dur="0.4s"
                                                begin={`${index * 0.15}s`}
                                                fill="freeze"
                                            />
                                        </circle>
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            No data available
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
