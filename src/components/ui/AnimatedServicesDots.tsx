"use client";
import { useEffect, useState } from "react";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Line,
} from "recharts";
import { Card, CardContent, CardTitle } from "@totesoft/ui-kit";

export function AnimatedServiceDots() {
    const [servicesData, setServicesData] = useState([]);
    const [visibleData, setVisibleData] = useState([]);

    useEffect(() => {
        const dummyServices = [
            { name: "OpenVPN", enabled: true, type: "VPN" },
            { name: "WireGuard", enabled: true, type: "VPN" },
            { name: "StrongSwan", enabled: true, type: "IPSec" },
        ];

        const formatted = dummyServices.map((svc, i) => ({
            x: i + 1,
            y: svc.enabled ? 1 : 0,
            name: svc.name,
            type: svc.type,
            enabled: svc.enabled,
        }));

        let i = 0;
        let animationInterval: string | number | NodeJS.Timeout | undefined;
        let refreshInterval;

        const startAnimation = () => {
            i = 0;
            setVisibleData([]);
            clearInterval(animationInterval);

            animationInterval = setInterval(() => {
                setVisibleData(formatted.slice(0, i + 1));
                i++;
                if (i >= formatted.length) {
                    clearInterval(animationInterval);
                }
            }, 300);
        };

        startAnimation();
        refreshInterval = setInterval(startAnimation, 3000);

        return () => {
            clearInterval(animationInterval);
            clearInterval(refreshInterval);
        };
    }, []);

    const hasData = visibleData.length > 0;

    return (
        <Card className="p-6 shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full flex flex-col">
            <CardTitle className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-2">
                Services Enabled
            </CardTitle>

            <CardContent className="flex-1">
                <div className="w-full h-[400px] overflow-visible">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 30, bottom: 50, left: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="x"
                                    type="number"
                                    domain={[1, visibleData.length]}
                                    tickFormatter={(v) => visibleData[v - 1]?.name || ""}
                                    label={{
                                        value: "Service",
                                        position: "insideBottom",
                                        offset: -5,
                                    }}
                                />

                                <YAxis
                                    dataKey="y"
                                    ticks={[0, 1]}
                                    domain={[0, 1]}
                                    label={{
                                        value: "Enabled",
                                        angle: -90,
                                        position: "insideLeft",
                                        offset: 10,
                                    }}
                                />

                                <Tooltip
                                    formatter={(value, name, props) =>
                                        props.payload.enabled ? "Enabled" : "Disabled"
                                    }
                                    labelFormatter={(label) => visibleData[label - 1]?.name || ""}
                                />

                                {/* Line connecting the scatter dots */}
                                <Line
                                    type="monotone"
                                    data={visibleData}
                                    dataKey="y"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />

                                {/* Scatter dots */}
                                <Scatter data={visibleData} fill="#3B82F6" shape="circle" />
                            </ScatterChart>
                        </ResponsiveContainer>

                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            No data available
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


// "use client";

// import { useEffect, useState } from "react";
// import {
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     ResponsiveContainer,
//     LabelList,
// } from "recharts";
// import { Card, CardContent, CardTitle } from "@totesoft/ui-kit";

// export default function AnimatedServiceDots() {
//     const [data, setData] = useState([
//         { name: "OpenVPN", enabled: 0 },
//         { name: "WireGuard", enabled: 0 },
//         { name: "StrongSwan", enabled: 0 },
//     ]);

//     useEffect(() => {
//         const dummyServices = [
//             { name: "OpenVPN", enabled: true, type: "VPN" },
//             { name: "WireGuard", enabled: true, type: "VPN" },
//             { name: "StrongSwan", enabled: true, type: "IPSec" },
//         ];

//         const targetData = dummyServices.map((svc) => ({
//             name: svc.name,
//             enabled: svc.enabled ? 1 : 0,
//         }));

//         // Animate bar growth
//         let step = 0;
//         const maxSteps = 20;
//         const interval = setInterval(() => {
//             step++;
//             setData((prev) =>
//                 prev.map((item, i) => ({
//                     ...item,
//                     enabled: Math.min(
//                         (targetData[i].enabled * step) / maxSteps,
//                         targetData[i].enabled
//                     ),
//                 }))
//             );
//             if (step >= maxSteps) clearInterval(interval);
//         }, 100);

//         return () => clearInterval(interval);
//     }, []);

//     return (
//         <Card className="p-6 shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full flex flex-col">
//             <CardTitle className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-4">
//                 Service Status (Enabled / Disabled)
//             </CardTitle>

//             <CardContent className="flex-1">
//                 <ResponsiveContainer width="100%" height={350}>
//                     <BarChart
//                         data={data}
//                         margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
//                     >
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis
//                             dataKey="name"
//                             tick={{ fill: "#4b5563", fontSize: 14 }}
//                             tickLine={false}
//                         />
//                         <YAxis
//                             domain={[0, 1]}
//                             tickFormatter={(v) => (v === 1 ? "Enabled" : "Disabled")}
//                             tick={{ fill: "#4b5563", fontSize: 14 }}
//                             tickLine={false}
//                         />
//                         <Tooltip
//                             formatter={(v) => (v === 1 ? "Enabled" : "Disabled")}
//                             cursor={{ fill: "rgba(0,0,0,0.05)" }}
//                         />
//                         <Bar
//                             dataKey="enabled"
//                             fill="#4281f5"
//                             radius={[10, 10, 0, 0]}
//                             animationDuration={1500}
//                         >
//                             <LabelList
//                                 dataKey="enabled"
//                                 position="top"
//                                 formatter={(v) => (v === 1 ? "Enabled" : "Disabled")}
//                                 fill="#111827"
//                                 fontSize={14}
//                             />
//                         </Bar>
//                     </BarChart>
//                 </ResponsiveContainer>
//             </CardContent>
//         </Card>
//     );
// }
