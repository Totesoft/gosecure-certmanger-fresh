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
        // Dummy services
        const dummyServices = [
            { name: "OpenVPN", enabled: true, type: "VPN" },
            { name: "WireGuard", enabled: true, type: "VPN" },
            { name: "StrongSwan", enabled: true, type: "IPSec" },
        ];

        const formatted = dummyServices.map((svc, i) => ({
            x: i + 1,
            y: svc.enabled ? 1 : 0,
            name: svc.name,
            type: svc.type,
            enabled: svc.enabled,
        }));

        let i = 0;
        let animationInterval: any;
        let refreshInterval: any;

        const startAnimation = () => {
            i = 0;
            setVisibleData([]);
            clearInterval(animationInterval);

            animationInterval = setInterval(() => {
                setVisibleData(formatted.slice(0, i + 1));
                i++;
                if (i >= formatted.length) {
                    clearInterval(animationInterval);
                }
            }, 300);
        };

        // Run once immediately
        startAnimation();

        // Re-run every 3 seconds
        refreshInterval = setInterval(startAnimation, 3000);

        return () => {
            clearInterval(animationInterval);
            clearInterval(refreshInterval);
        };
    }, []);

    const bluePalette = ["#60a5fa", "#93c5fd", "#bfdbfe"];
    const hasData = visibleData.length > 0;

    return (
        <Card className="p-6 shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full flex flex-col">
            <CardTitle className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-2">
                Services Enabled
            </CardTitle>

            <CardContent className="flex-1">
                <div className="w-full h-[400px] overflow-visible">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 30, bottom: 50, left: 50 }}>
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
                                    formatter={(value, name, props) =>
                                        props.payload.enabled ? "Enabled" : "Disabled"
                                    }
                                    labelFormatter={(label) => visibleData[label - 1]?.name || ""}
                                />

                                {/* Let Recharts handle layout */}
                                <Scatter data={visibleData} fill="#3B82F6" shape="circle">
                                    {visibleData.map((entry, index) => (
                                        <animate
                                            key={index}
                                            attributeName="r"
                                            from="0"
                                            to="18"
                                            dur="0.4s"
                                            begin={`${index * 0.15}s`}
                                            fill="freeze"
                                        />
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
