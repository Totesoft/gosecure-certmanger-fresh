"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@totesoft/ui-kit";

interface AnimatedChartProps {
    title?: string;
    data: { name: string; value: number }[];
    color?: string;
    duration?: number; // total animation time in ms
}

export function AnimatedChart({
    title = "Performance",
    data,
    color = "#6b7280",
    duration = 2000,
}: AnimatedChartProps) {
    const [visibleData, setVisibleData] = useState<typeof data>([]);

    // progressively reveal points
    useEffect(() => {
        let index = 0;
        setVisibleData([data[0]]);

        const interval = setInterval(() => {
            index++;
            if (index < data.length) {
                setVisibleData(data.slice(0, index + 1));
            } else {
                clearInterval(interval);
            }
        }, duration / data.length);

        return () => clearInterval(interval);
    }, [data, duration]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-smp-4 h-80">
                <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </CardTitle>
                </div>
                <CardContent>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={visibleData}>
                                <defs>
                                    <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6b7280" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#6b7280" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                {/* <Tooltip /> */}
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const { name, value, connections } = payload[0].payload;
                                            return (
                                                <div className="bg-gray-800 text-white p-2 rounded-md shadow-md text-sm">
                                                    <div><strong>{name}</strong></div>
                                                    <div>Uptime: {value.toFixed(2)} h</div>
                                                    <div>Connections: {connections}</div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6b7280"
                                    strokeWidth={2}
                                    fill="url(#fillColor)"
                                    isAnimationActive={false}
                                />

                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </div>
        </motion.div>
    );
}
