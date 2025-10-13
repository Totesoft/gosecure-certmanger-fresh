import { Card } from "@totesoft/ui-kit";

interface Service {
    service_name: string;
    status: string;
    connections: number;
}

interface StatusData {
    agent: { name: string; version: string; uptime: string };
    services: Service[];
}

interface Props {
    data: StatusData | null;
}

export default function StatusCard({ data }: Props) {
    if (!data) return null;

    return (
        <Card className="p-6 rounded-xl shadow-lg bg-white flex flex-col gap-4">
            <h2 className="text-xl font-bold">Monitoring Status(All VPN Services)</h2>

            <div>
                <span className="font-semibold">Agent:</span> {data.agent.name} (v{data.agent.version})
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.services.map((svc) => (
                    <Card
                        key={svc.service_name}
                        className={`p-4 rounded-md ${svc.status === "active" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-400"
                            } border`}
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">{svc.service_name}</span>
                            <span
                                className={`px-2 py-1 rounded-full text-white text-sm ${svc.status === "active" ? "bg-green-300" : "bg-red-500"
                                    }`}
                            >
                                {svc.status}
                            </span>
                        </div>
                        <div className="text-sm mt-1">Connections: {svc.connections}</div>
                    </Card>
                ))}
            </div>
        </Card>
    );
}
