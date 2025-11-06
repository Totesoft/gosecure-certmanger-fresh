import React, { useState } from "react";
import { Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@totesoft/ui-kit";

interface Service {
    name: string;
    enabled: boolean;
    type?: string;
}

interface ListServicesMetricCardProps {
    services: Service[];
}

// const MetricCard: React.FC<{ icon: React.ReactNode; title: string; value: number | string; subtext?: string }> = ({
//     icon,
//     title,
//     value,
//     subtext,
// }) => (
//     <div className="border-t-primary p-4 rounded-xl hover:shadow-xl transition border-gray-100">
//         <div className="flex justify-between items-center mb-2">
//             <h3 className="font-semibold uppercase text-sm">{title}</h3>
//             {icon}
//         </div>
//         <div className="text-2xl font-bold">{value}</div>
//         {subtext && <p className="text-sm mt-1">{subtext}</p>}
//     </div>
// );

// const ListServicesMetricCard: React.FC<ListServicesMetricCardProps> = ({ services }) => {
//     const [servicesHovered, setServicesHovered] = useState(false);

//     return (
//         <div
//             className="relative inline-block"
//             onMouseEnter={() => setServicesHovered(true)}
//             onMouseLeave={() => setServicesHovered(false)}
//         >
//             <MetricCard
//                 icon={<Users className="h-6 w-6 text-purple-500" />}
//                 title="List Monitored Services"
//                 value={services.length}
//                 subtext={`Enabled: ${services.filter(s => s.enabled).length} | ${services.map(s => s.name).join(", ")}`}
//             />

//             {/* Tooltip / Details box */}
//             {servicesHovered && services.length > 0 && (
//                 <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
//                     <h4 className="font-semibold mb-2">Service Details:</h4>
//                     {services.map((s) => (
//                         <div
//                             key={s.name}
//                             className="flex flex-col mb-2 p-2 rounded bg-gray-700/30"
//                         >
//                             <div className="flex items-center gap-2">
//                                 <span className="font-bold">{s.enabled ? "✔" : "✖"}</span>
//                                 <span>{s.name}</span>
//                             </div>
//                             <div className="ml-6 text-sm">
//                                 <div>Enabled: {s.enabled ? "Yes" : "No"}</div>
//                                 <div>Type: {s.type || "N/A"}</div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };






const ListServicesMetricCard: React.FC<ListServicesMetricCardProps> = ({ services }) => {
    const [servicesHovered, setServicesHovered] = useState(false);
    const enabledCount = services.filter(s => s.enabled).length;

    // Dynamic top border color based on enabled services
    const borderColor =
        enabledCount === services.length
            ? "border-t-green-500"
            : enabledCount === 0
                ? "border-t-red-500"
                : "border-t-yellow-400";

    return (
        <div
            className="relative"
            onMouseEnter={() => setServicesHovered(true)}
            onMouseLeave={() => setServicesHovered(false)}
        >
            {/* Unified Metric Card Design */}
            <div
                // className={`relative border-t-4 ${borderColor} p-5 rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full min-h-[150px]`}
                className="h-full relative border-t-4 border-t-gray-400 p-5 rounded-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"

            >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-extrabold text-lg tracking-wide text-blue-800 dark:text-blue-400">
                        List Monitored Services
                    </h3>
                    <Users className="h-7 w-7 text-purple-500 dark:text-purple-400" />
                </div>

                {/* Main Data */}
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                    {services.length > 0 ? `${services.length} Services` : "0 Services"}
                </div>

                <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                    Enabled: {enabledCount} / {services.length}
                </p>

                <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                    {services.length > 0
                        ? services.map((s) => s.name).join(", ")
                        : "No monitored services available."}
                </p>
            </div>

            {/* Tooltip */}
            {servicesHovered && services.length > 0 && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                    <h4 className="font-semibold mb-2">Service Details:</h4>
                    {services.map((s) => (
                        <div
                            key={s.name}
                            className={`flex flex-col mb-2 p-2 rounded ${s.enabled ? "bg-blue-900/30" : "bg-gray-700/30"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={`font-bold ${s.enabled ? "text-green-400" : "text-red-400"
                                        }`}
                                >
                                    {s.enabled ? "✔" : "✖"}
                                </span>
                                <span>{s.name}</span>
                            </div>
                            <div className="ml-6 text-sm">
                                <div>Enabled: {s.enabled ? "Yes" : "No"}</div>
                                <div>Type: {s.type || "N/A"}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ListServicesMetricCard;
