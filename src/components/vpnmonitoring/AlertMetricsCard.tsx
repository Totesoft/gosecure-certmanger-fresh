"use client";
import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface Alert {
    message?: string;
    service?: string;
    severity?: string;
    timestamp?: string;
}

interface AlertMetricsCardProps {
    alerts?: Alert[];
}

export default function AlertMetricsCard({ alerts = [] }: AlertMetricsCardProps) {
    const [alertshovered, setAlertshovered] = useState(false);

    const alertCount = alerts.length;
    const hasAlerts = alertCount > 0;

    // Dynamic border color: red if alerts exist, gray if none
    const borderColor = hasAlerts ? "border-t-red-500" : "border-t-gray-400";

    return (
        <div
            className="relative"
            onMouseEnter={() => setAlertshovered(true)}
            onMouseLeave={() => setAlertshovered(false)}
        >
            {/* Card Container */}
            <div
                // className={`border-t-4 ${borderColor} p-5 rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full min-h-[150px] flex flex-col justify-between`}

                className={`border-t-4 ${borderColor} p-5 rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full min-h-[150px] flex flex-col justify-between`}
            >

                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-extrabold text-lg tracking-wide text-blue-800 dark:text-blue-400">
                        Active Alerts
                    </h3>
                    <AlertTriangle
                        className={`h-7 w-7 ${hasAlerts ? "text-red-500" : "text-gray-400"}`}
                    />
                </div>

                {/* Value and Subtext */}
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                    {`${alertCount} Alerts`}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {hasAlerts ? "Requires attention" : "All systems healthy"}
                </p>
            </div>

            {/* Tooltip - Alerts */}
            {alertshovered && hasAlerts && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                    <h4 className="font-semibold mb-2">Alert Details</h4>
                    {alerts.map((a, index) => (
                        <div
                            key={index}
                            className="flex flex-col gap-1 mb-2 p-2 rounded bg-red-900/30"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-red-400 font-bold">⚠</span>
                                <span>{a.message || "Unknown Alert"}</span>
                            </div>
                            <div className="text-xl ml-6">
                                <div>Service: {a.service || "N/A"}</div>
                                <div>Severity: {a.severity || "N/A"}</div>
                                <div>Time: {a.timestamp || "N/A"}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tooltip - No Alerts */}
            {alertshovered && !hasAlerts && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-center">
                    <p className="text-xl  text-white dark:text-gray-400">All systems healthy — no active alerts.</p>
                </div>
            )}
        </div>
    );
}
