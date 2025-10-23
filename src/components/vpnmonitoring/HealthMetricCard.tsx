import React from "react";
import { Activity, CheckCircle, XCircle } from "lucide-react";
import { Bar } from "react-chartjs-2";

// Reusable MetricCard
export const MetricCard = ({ icon, title, value, subtext }) => (
    <div className="border-t-primary p-4 rounded-xl hover:shadow-xl transition border-gray-100">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold uppercase text-sm">{title}</h3>
            {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm mt-1">{subtext}</p>
    </div>
);

// Centered health chart + status
export const HealthStatusCard = ({ health }) => {  // <-- renamed to match usage
    const isHealthy = health.status?.toLowerCase() === "healthy";
    return (
        <div className="shadow-xl rounded-xl p-4 h-64 md:h-95 flex flex-col justify-center items-center mt-4">
            <h3 className="font-semibold mb-4">Monitoring Health</h3>
            {isHealthy ? (
                <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
            ) : (
                <XCircle className="h-16 w-16 text-red-500 mb-2" />
            )}
            <span className={`text-2xl font-bold ${isHealthy ? "text-green-600" : "text-red-600"}`}>
                {health.status ? health.status.toUpperCase() : "UNKNOWN"}
            </span>

            {/* Health Chart */}
            <div className="w-full mt-4 h-24">
                <Bar
                    data={{
                        labels: ["Healthy", "Unhealthy"],
                        datasets: [
                            {
                                data: [isHealthy ? 1 : 0, isHealthy ? 0 : 1],
                                backgroundColor: ["#22c55e", "#ef4444"],
                                hoverOffset: 4,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                    }}
                />
            </div>
        </div>
    );
};

// Default export combining both
export const HealthMetricCard = ({ health, hovered, setHovered }) => (
    <>
        <MetricCard
            icon={<Activity className="h-6 w-6 text-blue-500" />}
            title="Monitoring Health"
            value={health.status || "Unknown"}
            subtext={`Version: ${health.version || "N/A"}`}
        />
        <HealthStatusCard health={health} />
    </>
);

export default HealthMetricCard; // <-- fixed to match actual component
