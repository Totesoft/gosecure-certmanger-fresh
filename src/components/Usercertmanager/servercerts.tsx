import { servercertsmockdata } from "@/pages/AdmnCertmanagerMockdata";
import type { ServerCertificate } from "@/pages/UserCertmanager";
import { useState } from "react";

const [servercerts, setServercerts] = useState<ServerCertificate[]>([]);
const [loadingServers, setLoadingServers] = useState(false);
const [serverError, setServerError] = useState("");


export const fetchServercerts = async () => {
    setLoadingServers(true);
    setServerError("");
    console.log('ssssssssssssssservers', servercerts)

    try {
        // const res = await axios.get(`${API_BASE_URL}/certificates/server/`);
        // setServers(res.data || []);
        // console.log("API RESPONSE:", res.data);
        const serverRes = servercertsmockdata;   // mock array
        setServercerts(serverRes);

    } catch (err) {
        console.error("Fetch servers error:", err);
        setServerError("Failed to fetch server certificates");
    } finally {
        setLoadingServers(false);
    }
};

export const renderServerCertsTable = () => (
    <table className="min-w-full border border-gray-200 rounded-lg shadow">
        <thead className="bg-gray-100">
            <tr>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Common Name</th>
                <th className="px-4 py-2 border">Intermediate CA</th>
                <th className="px-4 py-2 border">Valid Until</th>
                {/* <th className="px-4 py-2 border">Actions</th> */}
            </tr>
        </thead>

        <tbody>
            {servercerts.map((cert) => {
                const days = daysRemaining(cert.valid_until);
                const status = getStatusStyles(cert.is_active, days);

                return (
                    <tr key={cert.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">
                            <span className={"px-2 py-1 rounded text-sm " + status.className}>
                                {status.text}
                            </span>
                        </td>

                        <td className="px-4 py-2 border">{cert.id}</td>

                        <td className="px-4 py-2 border">{cert.common_name}</td>

                        <td className="px-4 py-2 border">{cert.intermediate_ca_id}</td>

                        <td className="px-4 py-2 border">
                            {new Date(cert.valid_until).toISOString().split("T")[0]}
                        </td>

                        <td className="px-4 py-2 border">
                            {/* <button className="underline text-blue-500">
                                    Download
                                </button> */}
                        </td>
                    </tr>
                );
            })}
        </tbody>
    </table>
);
function daysRemaining(valid_until: string) {
    throw new Error("Function not implemented.");
}

function getStatusStyles(is_active: boolean, days: any) {
    throw new Error("Function not implemented.");
}

