"use client";
import React from "react";
import {
    buildStyles,
    CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { TrendingUp, TrendingDown } from "lucide-react";
//import { Card } from "@/components/ui/card"; // shadcn card wrapper
import { Card } from "@totesoft/ui-kit"; // shadcn card wrapper

interface CircularMetricCardProps {
    title: string;
    value: number; // main % value (e.g. 57)
    change: number; // percentage change
    color?: string; // tailwind/hex color
}

export function CircularMetricCard({ title, status }) {
    const normalized = status?.toLowerCase() || "unknown";
    const { value, color } = {
        active: { value: 100, color: "#3CB371" },
        inactive: { value: 50, color: "#C0723D" },
        disabled: { value: 0, color: "#9ca3af" },
        error: { value: 80, color: "#DC2626" },
    }[normalized] || { value: 0, color: "#9ca3af" };

    return (
        <Card className="flex flex-col items-center justify-center p-5 rounded-2xl shadow-lg dark:bg-gray-900 transition-all">
            <CircularProgressbarWithChildren
                value={value}
                strokeWidth={10}
                styles={buildStyles({
                    pathColor: color,
                    trailColor: "rgba(0,0,0,0.08)",
                    strokeLinecap: "round",
                })}
            >
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {value}%
                    </p>
                </div>
            </CircularProgressbarWithChildren>
            <div className="text-center mt-3">
                <p className="text-md font-semibold text-gray-700 dark:text-gray-300">
                    {title}
                </p>
                <p className="text-sm font-medium mt-1 capitalize text-gray-600">
                    {normalized}
                </p>
            </div>
        </Card>
    );
}

export default CircularMetricCard;