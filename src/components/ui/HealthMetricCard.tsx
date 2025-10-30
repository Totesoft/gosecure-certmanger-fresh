"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@totesoft/ui-kit";
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

    return (
        <div
            className="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Card className="mb-4">
                <CardHeader className="flex items-center">
                    <CardTitle className="flex items-center gap-2">
                        Monitoring Health
                        <Activity className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center justify-between">
                        {/* Status Badge */}
                        <span>
                            {health ? (
                                <Badge
                                    className={`px-2 py-1 rounded ${health.status?.toLowerCase() === "healthy"
                                            ? "bg-green-600"
                                            : "bg-red-600"
                                        } text-white`}
                                >
                                    {health.status}
                                </Badge>
                            ) : (
                                "-"
                            )}
                        </span>

                        {/* Version */}
                        <div>Version: {health?.version ?? "-"}</div>
                    </div>
                </CardContent>
            </Card>

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
