import React, { useState } from "react";
import { Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@totesoft/ui-kit";

interface Service {
    name: string;
    enabled: boolean;
    type?: string;
}

interface ListServicesMetricCardProps {
    services: Service[];
}

const MetricCard: React.FC<{ icon: React.ReactNode; title: string; value: number | string; subtext?: string }> = ({
    icon,
    title,
    value,
    subtext,
}) => (
    <div className="border-t-primary p-4 rounded-xl hover:shadow-xl transition border-gray-100">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold uppercase text-sm">{title}</h3>
            {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {subtext && <p className="text-sm mt-1">{subtext}</p>}
    </div>
);

const ListServicesMetricCard: React.FC<ListServicesMetricCardProps> = ({ services }) => {
    const [servicesHovered, setServicesHovered] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setServicesHovered(true)}
            onMouseLeave={() => setServicesHovered(false)}
        >
            <MetricCard
                icon={<Users className="h-6 w-6 text-purple-500" />}
                title="List Monitored Services"
                value={services.length}
                subtext={`Enabled: ${services.filter(s => s.enabled).length} | ${services.map(s => s.name).join(", ")}`}
            />

            {/* Tooltip / Details box */}
            {servicesHovered && services.length > 0 && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                    <h4 className="font-semibold mb-2">Service Details:</h4>
                    {services.map((s) => (
                        <div
                            key={s.name}
                            className="flex flex-col mb-2 p-2 rounded bg-gray-700/30"
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{s.enabled ? "✔" : "✖"}</span>
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
};

export default ListServicesMetricCard;
