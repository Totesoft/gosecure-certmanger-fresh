// src/components/HealthCard.jsx
import React from "react";
import { Activity, CheckCircle, XCircle } from "lucide-react";
import { Bar } from "react-chartjs-2";
//import MetricCard from "./MetricCard"; // Assuming MetricCard is also a separate reusable component

const HealthCard = ({ health, hovered, setHovered }) => {
    // Health Chart configuration
    const healthChart = {
        labels: ["Healthy", "Unhealthy"],
        datasets: [
            {
                data: [health.status === "healthy" ? 1 : 0, health.status === "healthy" ? 0 : 1],
                backgroundColor: ["#22c55e", "#ef4444"],
                hoverOffset: 4,
            },
        ],
    };
    const MetricCard = ({ icon, title, value, subtext }) => (
        <div className=" border-t-primary p-4 rounded-xl hover:shadow-xl transition border-gray-100">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold uppercase text-sm">{title}</h3>
                {icon}
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-sm mt-1">{subtext}</p>
        </div>
    );

    return (
        <>
            {/* Metric Card with Tooltip */}
            <div
                className="relative"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <MetricCard
                    icon={<Activity className="h-6 w-6 text-blue-500" />}
                    title="Monitoring Health"
                    value={health.status || "Unknown"}
                    subtext={`Version: ${health.version || "N/A"}`}
                />
                {hovered && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 text-left">
                        <h4 className="font-semibold mb-2">Health Details</h4>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-400 font-bold">✔</span>
                            <span>Status: {health.status || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-400 font-bold">✔</span>
                            <span>Version: {health.version || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-blue-400 font-bold">✔</span>
                            <span>Timestamp: {health.timestamp || "N/A"}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Centered Health Status */}
            <div className="shadow-xl rounded-xl p-4 h-64 md:h-95 flex flex-col justify-center items-center mt-4">
                <h3 className="font-semibold mb-4">Monitoring Health</h3>
                {health.status?.toLowerCase() === "healthy" ? (
                    <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
                ) : (
                    <XCircle className="h-16 w-16 text-red-500 mb-2" />
                )}
                <span
                    className={`text-2xl font-bold ${health.status?.toLowerCase() === "healthy" ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {health.status ? health.status.toUpperCase() : "UNKNOWN"}
                </span>

                {/* Optional: Bar chart visualization of Healthy vs Unhealthy */}
                <div className="w-full mt-4 h-24">
                    <Bar
                        data={healthChart}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                        }}
                    />
                </div>
            </div>
        </>
    );
};

export default HealthCard;
