"use client";
import React from "react";

interface Service {
    Name: string;
    Type: string;
    Status: string;
    Uptime: number;
    Connections: number;
    PID: number;
    LastCheck: string;
}

interface ServiceDetailsTableProps {
    ovpn: Service | null;
    wireguard: Service | null;
    strongswan: Service | null;
}

export default function ServiceDetailsTable({
    ovpn,
    wireguard,
    strongswan,
}: ServiceDetailsTableProps) {
    const vpnServices = [ovpn, wireguard, strongswan].filter(Boolean) as Service[];

    return (
        <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
                VPN Service Details
            </h2>

            <div className="shadow-xl rounded-xl p-6 bg-white dark:bg-gray-800 overflow-x-auto transition-colors duration-300">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-indigo-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            <th className="px-4 py-3 text-left font-semibold">Service</th>
                            <th className="px-4 py-3 text-left font-semibold">Type</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 text-left font-semibold">Uptime (h)</th>
                            <th className="px-4 py-3 text-left font-semibold">Connections</th>
                            <th className="px-4 py-3 text-left font-semibold">PID</th>
                            <th className="px-4 py-3 text-left font-semibold">Last Check</th>
                        </tr>
                    </thead>

                    <tbody>
                        {vpnServices.map((vpn, i) => (
                            <tr
                                key={i}
                                className={`border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 ${vpn.Status?.toLowerCase() === "active"
                                        ? "bg-blue-50 dark:bg-blue-900/20"
                                        : "bg-gray-50 dark:bg-gray-900/30"
                                    }`}
                            >
                                <td className="px-4 py-3 font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                    {vpn.Name}
                                </td>
                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                    {vpn.Type}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className="px-2 py-1 text-sm rounded text-white"
                                        style={{
                                            backgroundColor:
                                                vpn.Status?.toLowerCase() === "active"
                                                    ? "#C0723D"
                                                    : "#6b7280",
                                        }}
                                    >
                                        {vpn.Status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                                    {((vpn.Uptime / 1e9) / 60 / 60).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                                    {vpn.Connections}
                                </td>
                                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                                    {vpn.PID}
                                </td>
                                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                                    {vpn.LastCheck}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
