"use client";
import React from "react";
import { Card } from "@totesoft/ui-kit";
import { Clock, BarChart } from "lucide-react";

interface MetricsData {
    timestamp?: string;
    metrics?: any[];
}

interface SystemMetricsProps {
    metrics: MetricsData;
    DetailItem: React.ComponentType<{
        icon: React.ReactNode;
        label: string;
        value: string | number;
    }>;
}

export default function SystemMetrics({ metrics, DetailItem }: SystemMetricsProps) {
    return (
        <Card className="shadow-xl rounded-xl p-4 h-64 md:h-95 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-400">System Metrics</h2>

            <DetailItem
                icon={<Clock className="h-5 w-5 text-blue-500" />}
                label="Timestamp"
                value={metrics.timestamp || "N/A"}
            />

            <DetailItem
                icon={<BarChart className="h-5 w-5 text-green-500" />}
                label="Metrics Count"
                value={metrics.metrics?.length || 0}
            />
        </Card>
    );
}
