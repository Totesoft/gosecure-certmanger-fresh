"use client";
import React, { useState } from "react";
import { Activity } from "lucide-react";

interface HealthData {
    status?: string;
    version?: string;
    timestamp?: string;
}

interface HealthMetricCardProps {
    health: HealthData | null;
}

export default function HealthMetricCard({ health }: HealthMetricCardProps) {
    const [hovered, setHovered] = useState(false);

    const borderColor =
        health?.status?.toLowerCase() === "healthy"
            ? "border-t-green-500"
            : "border-t-red-500";

    return (
        <div
            className="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Metric Card */}
            <div
                // className={`border-t-4 ${borderColor} p-5 rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full`}
                className="relative border-t-4 border-t-gray-400 p-5 rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
                {/* Title Row */}
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-extrabold text-lg tracking-wide text-gray-800 dark:text-gray-100">
                        Monitoring Health
                    </h3>
                    <Activity className="h-7 w-7 text-blue-500 dark:text-blue-400" />
                </div>

                {/* Main Content */}
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                    {health?.status || "Unknown"}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Version: {health?.version || "-"}
                </p>
            </div>

            {/* Hover Tooltip */}
            {hovered && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                    <h4 className="font-semibold mb-2">Health Details</h4>
                    <div className="space-y-1 text-sm">
                        <div>Status: {health?.status || "N/A"}</div>
                        <div>Version: {health?.version || "N/A"}</div>
                        <div>Timestamp: {health?.timestamp || "N/A"}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
