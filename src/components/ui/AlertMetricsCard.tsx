import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@totesoft/ui-kit";
import { AlertTriangle } from "lucide-react";

interface Alert {
    message?: string;
    service?: string;
    severity?: string;
    timestamp?: string;
}

interface AlertMetricsCardProps {
    alerts?: Alert[];
}

const MetricCard: React.FC<{ icon: React.ReactNode; title: string; value: string; subtext: string }> = ({
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
        <p className="text-sm mt-1">{subtext}</p>
    </div>
);

const AlertMetricsCard: React.FC<AlertMetricsCardProps> = ({ alerts = [] }) => {
    const [alertshovered, setAlertshovered] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setAlertshovered(true)}
            onMouseLeave={() => setAlertshovered(false)}
        >
            <Card className="mb-4">
                <CardHeader className="flex items-center">
                    <CardTitle className="flex items-center gap-2">
                        Active Alerts
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Badge
                            className={`px-2 py-1 rounded ${alerts.length > 0 ? "bg-red-600 text-white" : "bg-green-600 text-white"
                                }`}
                        >
                            {alerts.length > 0 ? `${alerts.length} Active` : "No Alerts"}
                        </Badge>
                        <div className="text-sm text-gray-600 dark:text-gray-300 text-right">
                            Current monitoring alerts
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tooltip with alert details */}
            {alertshovered && alerts.length > 0 && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                    <h4 className="font-semibold mb-2">Alert Details:</h4>
                    {alerts.map((a, index) => (
                        <div key={index} className="flex flex-col gap-1 mb-2 p-2 rounded bg-red-900/30">
                            <div className="flex items-center gap-2">
                                <span className="text-red-400 font-bold">⚠</span>
                                <span>{a.message || "Unknown Alert"}</span>
                            </div>
                            <div className="text-sm ml-6">
                                <div>Service: {a.service || "N/A"}</div>
                                <div>Severity: {a.severity || "N/A"}</div>
                                <div>Time: {a.timestamp || "N/A"}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tooltip when no alerts */}
            {alertshovered && alerts.length === 0 && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-center">
                    <p className="text-sm ml-6">All systems healthy — no active alerts.</p>
                </div>
            )}
        </div>
    );
};

export default AlertMetricsCard;
