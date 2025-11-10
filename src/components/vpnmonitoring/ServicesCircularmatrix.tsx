"use client";
import React from "react";
import {
    buildStyles,
    CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Card } from "@totesoft/ui-kit";

interface CircularMetricCardProps {
    title: string;
    status: string; // e.g. "active", "inactive", "error"
}

export function CircularMetricCard({ title, status }: CircularMetricCardProps) {
    // Normalize the status string
    const normalized = status?.toLowerCase() || "unknown";

    // Set value and color based on status
    const { value, color, labelColor } = (() => {
        switch (normalized) {
            case "active":
                return { value: 100, color: "#3CB371", labelColor: "text-green-600" }; // green
            case "inactive":
                return { value: 50, color: "#C0723D", labelColor: "text-yellow-600" }; // brown
            case "disabled":
                return { value: 0, color: "#9ca3af", labelColor: "text-gray-500" }; // gray
            case "error":
                return { value: 80, color: "#DC2626", labelColor: "text-red-600" }; // red
            default:
                return { value: 0, color: "#9ca3af", labelColor: "text-gray-500" };
        }
    })();

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
                <p className={`text-sm font-medium mt-1 ${labelColor}`}>
                    {status || "Unknown"}
                </p>
            </div>
        </Card>
    );
}

export default function ServicesCircularMetrics({ services }) {
    if (!services || services.length === 0) {
        return (
            <p className="text-gray-500 dark:text-gray-400 text-center">
                No services available.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
            {services.map((service, idx) => (
                <CircularMetricCard
                    key={idx}
                    title={service.name}
                    status={service.status || (service.enabled ? "active" : "inactive")}
                />
            ))}
        </div>
    );
}
