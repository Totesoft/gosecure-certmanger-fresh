"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { Card, CardContent, CardTitle } from "@totesoft/ui-kit";

const dummyConnectionsData = [
    {
        name: "OpenVPN",
        connections: 1,
    },
    {
        name: "WireGuard",
        connections: 0,
    },
    {
        name: "StrongSwan",
        connections: 0,
    },
];

export default function ServiceConnectionsChart() {
    return (
        <Card className="p-6 shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full flex flex-col">
            <CardTitle className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-4">
                Active Connections
            </CardTitle>

            <CardContent className="flex-1 ">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dummyConnectionsData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value} connections`} />
                        <Bar dataKey="connections" fill="#3B82F6" radius={[10, 10, 0, 0]}>
                            <LabelList dataKey="connections" position="top" fill="#000" style={{ fontSize: '16px' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
