"use client";
import { useEffect, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardTitle } from "@totesoft/ui-kit";

interface AnimatedChartProps {
    title?: string;
    data?: { name: string; value: number; connections?: number }[];
    color?: string;
    duration?: number;
}

export function AnimatedServiceUptimeChart({
    title = "Service Uptime (hours)",
    data = [],
    color = "#3B82F6", // blue tone
    duration = 2000,
}: AnimatedChartProps) {
    const [visibleData, setVisibleData] = useState<typeof data>([]);

    useEffect(() => {
        if (!data || data.length === 0) return;

        let index = 0;
        let animationInterval: any;
        let refreshInterval: any;

        const startAnimation = () => {
            index = 0;
            setVisibleData([data[0]]);
            clearInterval(animationInterval);

            animationInterval = setInterval(() => {
                index++;
                if (index < data.length) {
                    setVisibleData(data.slice(0, index + 1));
                } else {
                    clearInterval(animationInterval);
                }
            }, duration / data.length);
        };

        // run immediately
        startAnimation();

        // repeat every 3 seconds
        refreshInterval = setInterval(startAnimation, 8000);

        return () => {
            clearInterval(animationInterval);
            clearInterval(refreshInterval);
        };
    }, [data, duration]);

    const hasData = data && data.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full"
        >
            <Card className="p-6 shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full flex flex-col">
                <CardTitle className="text-2xl font-bold text-blue-800 dark:text-blue-400">
                    {title}
                </CardTitle>

                <CardContent className="flex-1 h-full">
                    <div className="w-full h-full">
                        {hasData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={visibleData}>
                                    <defs>
                                        <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                                            <stop offset="100%" stopColor={color} stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                    <XAxis dataKey="name" stroke="#888" />
                                    <YAxis stroke="#888" />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const { name, value, connections } = payload[0].payload;
                                                return (
                                                    <div className="bg-gray-800 text-white p-2 rounded-md shadow-md text-sm">
                                                        <div><strong>{name}</strong></div>
                                                        <div>Uptime: {value?.toFixed(2)} h</div>
                                                        {connections !== undefined && (
                                                            <div>Connections: {connections}</div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={color}
                                        strokeWidth={3}
                                        fill="url(#fillColor)"
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <p>No data available</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
