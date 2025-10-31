"use client";
import React, { useState } from "react";
import { Users } from "lucide-react";

interface StatusItem {
    service_name: string;
    status: string;
    connections?: number;
    uptime?: string;
}

interface StatusMetricCardProps {
    status: StatusItem[];
}

export default function StatusMetricCard({ status }: StatusMetricCardProps) {
    const [hovered, setHovered] = useState(false);

    const activeServices = status.filter(
        (s) => s.status?.toLowerCase() === "active"
    );

    // Dynamic top border color based on number of active services
    const borderColor =
        activeServices.length === status.length
            ? "border-t-green-500"
            : activeServices.length === 0
                ? "border-t-green-500"
                : "border-t-red-500";

    return (
        <div
            className="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Unified Metric Card Design */}
            <div
                // className={`border-t-4 ${borderColor} p-5 rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full`}


                className="relative border-t-4 border-t-gray-400 p-5 rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-extrabold text-lg tracking-wide text-gray-800 dark:text-gray-100">
                        Monitored Status (All VPN Services)
                    </h3>
                    <Users className="h-7 w-7 text-blue-500 dark:text-blue-400" />
                </div>

                {/* Main Data */}
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                    {`${activeServices.length} / ${status.length} Active`}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active:{" "}
                    {activeServices.map((s) => s.service_name).join(", ") || "N/A"}
                </p>
            </div>

            {/* Tooltip */}
            {hovered && status.length > 0 && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                    <h4 className="font-semibold mb-2">Service Status Details</h4>
                    {status.map((s) => {
                        const isActive = s.status?.toLowerCase() === "active";
                        return (
                            <div
                                key={s.service_name}
                                className={`flex flex-col gap-1 mb-2 p-2 rounded ${isActive ? "bg-blue-900/30" : "bg-gray-700/30"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`font-bold ${isActive ? "text-green-400" : "text-gray-400"
                                            }`}
                                    >
                                        {isActive ? "✔" : "✖"}
                                    </span>
                                    <span
                                        className={isActive ? "text-green-400" : "text-gray-400"}
                                    >
                                        {s.service_name} ({s.status})
                                    </span>
                                </div>
                                <div className="text-sm ml-6">
                                    <div>Connections: {s.connections || 0}</div>
                                    <div>Uptime: {s.uptime || "0s"}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
