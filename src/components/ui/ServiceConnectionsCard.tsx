"use client";
import React from "react";
import { Card } from "@totesoft/ui-kit";

// Common interface for all three service responses
interface ServiceConnectionsCardProps {
    data:
    | {
        service: {
            Name: string;
            Type: string;
            Status: string;
            PID: number;
            Uptime: number;
            Connections: number;
            LastCheck: string;
            Config: any;
        };
        timestamp: string;
    }
    | null;
}

export default function ServiceConnectionsCard({ data }: ServiceConnectionsCardProps) {
    if (!data?.service) {
        return (
            <Card className="flex flex-col items-center justify-center p-5 rounded-2xl shadow-md dark:bg-gray-900 w-full">
                <p className="text-gray-600 dark:text-gray-400">No service data available</p>
            </Card>
        );
    }

    const { Name, PID, Connections, LastCheck } = data.service;

    return (
        <Card className="flex flex-col items-center justify-center p-6 rounded-2xl shadow-md dark:bg-gray-900 w-full">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {Name}
            </h2>

            <p className="text-4xl font-extrabold mb-3" style={{ color: "#C0723D" }}>
                {Connections}
            </p>

            <div className="text-center text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <p>PID: {PID}</p>
                <p>Last Check: {LastCheck}</p>
            </div>
        </Card>
    );
}
