// import { Card } from "@totesoft/ui-kit";

// type HealthData = {
//   status: string;
//   timestamp: number;
//   version: string;
// };

// interface Props {
//   data: HealthData | null;
// }

// export default function HealthCard({ data }: Props) {
//   if (!data) return null;

//   // Convert UNIX timestamp to human-readable format
//   const time = new Date(data.timestamp * 1000).toLocaleString();

//   // Color indicator based on status
//   const statusColor = data.status === "healthy" ? "bg-green-500" : "bg-red-500";

//   return (
//     <Card className="p-6 rounded-xl shadow-lg bg-white flex flex-col gap-3">
//       <h2 className="text-xl font-bold">System Health</h2>

//       <div className="flex items-center gap-2">
//         <span className={`w-3 h-3 rounded-full ${statusColor}`}></span>
//         <span className="capitalize font-semibold">{data.status}</span>
//       </div>

//       <div>
//         <span className="font-semibold">Version:</span> {data.version}
//       </div>

//       <div>
//         <span className="font-semibold">Last Checked:</span> {time}
//       </div>
//     </Card>
//   );
// }


import React from "react";
import { Card } from "@totesoft/ui-kit";
import { PieChart, Pie, Cell, Legend } from "recharts";

export default function HealthCard({ data }) {
  const healthData = [
    { name: "Healthy", value: data.status === "healthy" ? 1 : 0 },
    { name: "Unhealthy", value: data.status === "healthy" ? 0 : 1 },
  ];

  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-2">Monitoring Health</h2>

      <div className="flex items-center gap-8">
        <PieChart width={200} height={200}>
          <Pie
            data={healthData}
            cx={100}
            cy={100}
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
          >
            {healthData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>

        <div>
          <p className="text-lg font-medium">
            Status:{" "}
            <span
              className={`font-semibold ${data.status === "healthy" ? "text-green-600" : "text-red-600"
                }`}
            >
              {data.status}
            </span>
          </p>
          <p className="text-gray-600">Version: {data.version}</p>
          <p className="text-gray-600">
            Timestamp: {new Date(data.timestamp * 1000).toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}
