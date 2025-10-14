import React from "react";

export default function HealthCard({ data }) {
  if (!data) return null;

  const isHealthy = data.status === "healthy";
  const icon = isHealthy ? "✓" : "✗";
  const iconColor = isHealthy ? "text-green-600" : "text-red-600";

  const time = new Date(data.timestamp * 1000).toLocaleString();

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-2">
        <span className={`text-lg font-bold ${iconColor}`}>{icon}</span>
        <span className={`capitalize font-semibold ${iconColor}`}>
          {data.status}
        </span>
      </div>

      <div>
        <span className="font-semibold">Version:</span> {data.version}
      </div>

      <div>
        <span className="font-semibold">Last Checked:</span> {time}
      </div>
    </div>
  );
}
