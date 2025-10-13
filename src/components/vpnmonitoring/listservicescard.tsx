
import { Card } from "@totesoft/ui-kit";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

export default function ServicesCard({ data }) {
    const chartData = data.services.map((svc) => ({
        name: svc.name,
        Enabled: svc.enabled ? 1 : 0,
    }));

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">List Monitored Services</h2>

            <BarChart width={400} height={250} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Enabled" fill="#007bff" />
            </BarChart>

            <div className="mt-4">
                <h3 className="font-medium text-gray-700">Details:</h3>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    {data.services.map((svc, i) => (
                        <li key={i}>
                            {svc.name} —{" "}
                            <span className={svc.enabled ? "text-green-600" : "text-red-600"}>
                                {svc.enabled ? "Enabled" : "Disabled"}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    );
}
