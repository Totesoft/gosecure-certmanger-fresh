"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@totesoft/ui-kit";
import { Bar } from "react-chartjs-2";

interface AlertChartProps {
    alertChart: any;
}

export default function AlertChart({ alertChart }: AlertChartProps) {
    return (
        <Card className="shadow-xl rounded-xl p-4 h-64 md:h-95 flex flex-col">
            <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4 text-indigo-600">
                    Alerts per Service
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
                <div className="h-full w-full">
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
                        className="h-full w-full"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
