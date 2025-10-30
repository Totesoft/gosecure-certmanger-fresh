"use client";
import React, { useState } from "react";
import { Users } from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";

interface StatusItem {
    service_name: string;
    status: string;
    connections?: number;
    uptime?: string;
}

interface StatusMetricCardProps {
    status: StatusItem[];
}

const MetricCard = ({ icon, title, value, subtext }) => (
    <div className="border-t-primary p-4 rounded-xl hover:shadow-xl transition border-gray-100">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold uppercase text-sm">{title}</h3>
            {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm mt-1">{subtext}</p>
    </div>
);

export default function StatusMetricCard({ status }: StatusMetricCardProps) {
    const [hovered, setHovered] = useState(false);

    const activeServices = status.filter(
        (s) => s.status?.toLowerCase() === "active"
    );

    return (
        <div
            className="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <MetricCard
                icon={<Users className="h-6 w-6 text-blue-500" />}
                title="Monitored Status (All VPN Services)"
                value={`${activeServices.length} / ${status.length} Active`}
                subtext={`Active: ${activeServices.map((s) => s.service_name).join(", ") || "N/A"
                    }`}
            />

            {/* Hover Tooltip */}
            {hovered && status.length > 0 && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                    <h4 className="font-semibold mb-2">Service Status Details:</h4>
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
