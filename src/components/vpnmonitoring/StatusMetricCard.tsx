"use client";
import React, { useState } from "react";
import { Users } from "lucide-react";

interface StatusItem {
    service_name: string;
    status: string;
    connections?: number;
    uptime?: string;
}

interface StatusMetricCardProps {
    status: StatusItem[];
}

export default function StatusMetricCard({ status }: StatusMetricCardProps) {
    const [hovered, setHovered] = useState(false);

    const activeServices = status.filter(
        (s) => s.status?.toLowerCase() === "active"
    );

    // Dynamic top border color based on number of active services
    const borderColor =
        activeServices.length === status.length
            ? "border-t-green-500"
            : activeServices.length === 0
                ? "border-t-green-500"
                : "border-t-red-500";

    return (
        <div
            className="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Unified Metric Card Design */}
            <div
                // className={`border-t-4 ${borderColor} p-5 rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full`}


                className="h-full flex flex-col justify-between border-t-4 border-t-gray-400 p-5 rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"            >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-extrabold text-lg tracking-wide text-blue-800 dark:text-blue-400">
                        Monitored Status (All VPN Services)
                    </h3>
                    <Users className="h-7 w-7 text-blue-500 dark:text-blue-400" />
                </div>

                {/* Main Data */}

                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                    {`${activeServices.length} / ${status.length} services Active`}
                </div>

                <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                    Active:{" "}
                    {activeServices.map((s) => s.service_name).join(", ") || "N/A"}
                </p>
            </div>

            {/* Tooltip */}
            {hovered && status.length > 0 && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                    <h4 className="font-semibold mb-2">Service Status Details</h4>
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




// "use client";
// import React, { useState } from "react";
// import { Users } from "lucide-react";
// import { PieChart, Pie, Cell } from "recharts";

// export default function StatusMetricCard({ status }) {
//     const [hovered, setHovered] = useState(false);

//     const activeServices = status.filter(
//         (s) => s.status?.toLowerCase() === "active"
//     );

//     const activeCount = activeServices.length;
//     const totalCount = status.length;
//     const inactiveCount = totalCount - activeCount;

//     const chartData = [
//         { name: "Active", value: activeCount },
//         { name: "Inactive", value: inactiveCount },
//     ];

//     const COLORS = ["#22c55e", "#e5e7eb"]; // green + gray

//     return (
//         <div
//             className="relative transition-all duration-300 hover:scale-[1.02]"
//             onMouseEnter={() => setHovered(true)}
//             onMouseLeave={() => setHovered(false)}
//         >
//             {/* Card container */}
//             <div
//                 className="border-t-4 border-transparent bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800
//         border-t-blue-400 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col gap-4"
//             >
//                 {/* Header */}
//                 <div className="flex justify-between items-center">
//                     <h3 className="font-extrabold text-lg text-gray-800 dark:text-gray-200">
//                         Monitored Status
//                     </h3>
//                     <Users className="h-6 w-6 text-blue-500" />
//                 </div>

//                 {/* Main stats + Donut chart */}
//                 <div className="flex justify-between items-center">
//                     <div>
//                         <div className="text-4xl font-bold text-gray-900 dark:text-white">
//                             {`${activeCount} / ${totalCount}`}
//                         </div>
//                         <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
//                             Services Active
//                         </p>
//                     </div>

//                     {/* Small Donut chart */}
//                     <PieChart width={80} height={80}>
//                         <Pie
//                             data={chartData}
//                             dataKey="value"
//                             innerRadius={28}
//                             outerRadius={38}
//                             startAngle={90}
//                             endAngle={-270}
//                         >
//                             {chartData.map((entry, i) => (
//                                 <Cell key={i} fill={COLORS[i]} />
//                             ))}
//                         </Pie>
//                         <text
//                             x={40}
//                             y={43}
//                             textAnchor="middle"
//                             dominantBaseline="middle"
//                             className="text-sm font-bold fill-gray-800 dark:fill-gray-200"
//                         >
//                             {Math.round((activeCount / totalCount) * 100)}%
//                         </text>
//                     </PieChart>
//                 </div>

//                 {/* Active services list */}
//                 <div className="mt-2">
//                     <p className="text-md font-semibold text-gray-600 dark:text-gray-400">
//                         Active:{" "}
//                         <span className="text-blue-700 dark:text-blue-400">
//                             {activeServices.map((s) => s.service_name).join(", ") || "N/A"}
//                         </span>
//                     </p>
//                 </div>
//             </div>

//             {/* Tooltip */}
//             {hovered && status.length > 0 && (
//                 <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-80 bg-gray-800 text-white p-4 rounded-lg shadow-xl z-50 text-left">
//                     <h4 className="font-semibold mb-2 border-b border-gray-700 pb-1">
//                         Service Details
//                     </h4>
//                     {status.map((s) => {
//                         const isActive = s.status?.toLowerCase() === "active";
//                         return (
//                             <div
//                                 key={s.service_name}
//                                 className={`flex flex-col gap-1 mb-2 p-2 rounded ${isActive ? "bg-green-900/20" : "bg-gray-700/30"
//                                     }`}
//                             >
//                                 <div className="flex items-center gap-2">
//                                     <span
//                                         className={`font-bold ${isActive ? "text-green-400" : "text-gray-400"
//                                             }`}
//                                     >
//                                         {isActive ? "●" : "○"}
//                                     </span>
//                                     <span
//                                         className={`font-semibold ${isActive ? "text-green-300" : "text-gray-400"
//                                             }`}
//                                     >
//                                         {s.service_name} ({s.status})
//                                     </span>
//                                 </div>
//                                 <div className="text-sm ml-6 text-gray-300">
//                                     <div>Connections: {s.connections || 0}</div>
//                                     <div>Uptime: {s.uptime || "0s"}</div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}
//         </div>
//     );
// }
