"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@totesoft/ui-kit";

interface ServiceStatus {
    service_name: string;
    status: string;
}

interface ServiceStatusMetricsCardProps {
    status: ServiceStatus[];
}

export default function ServiceStatusBadges({ status }: ServiceStatusMetricsCardProps) {
    return (
        <Card className="shadow-xl rounded-xl border border-gray-100 p-4 overflow-y-auto h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-800 dark:text-blue-400">Service Status</CardTitle>
                <CardDescription className="text-md">
                    {status.filter(s => s.status?.toLowerCase() === "active").length} of {status.length} Services Active
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 flex-1">
                {status.map((service, i) => {
                    const isActive = service.status?.toLowerCase() === "active";

                    return (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{service.service_name}</span>
                                <span
                                    className="px-2 py-1 rounded text-sm text-white"
                                    style={{
                                        backgroundColor: isActive ? "#C0723D" : "#9ca3af",
                                    }}
                                >
                                    {isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div className="h-2 w-full bg-gray-200 rounded-full">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        backgroundColor: isActive ? "#C0723D" : "#9ca3af",
                                        width: isActive ? "100%" : "40%",
                                    }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
