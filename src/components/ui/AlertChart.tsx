"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@totesoft/ui-kit";
import { Bar } from "react-chartjs-2";

interface AlertChartProps {
    alertChart: any;
}

export default function AlertChart({ alertChart }: AlertChartProps) {
    return (
        <Card className="shadow-xl rounded-xl p-4 flex flex-col h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-indigo-600">
                    Alerts per Service
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden">
                <div className="w-full h-full relative">
                    <Bar
                        data={alertChart}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: true, position: "top" },
                            },
                            scales: {
                                x: {
                                    ticks: {
                                        autoSkip: false,
                                        maxRotation: 45,
                                        minRotation: 0,
                                        font: { size: 10 },
                                    },
                                    title: {
                                        display: true,
                                        text: "Services",
                                        font: { weight: "bold" },
                                    },
                                },
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: "Number of Alerts",
                                        font: { weight: "bold" },
                                    },
                                },
                            },
                        }}
                        className="absolute inset-0"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
