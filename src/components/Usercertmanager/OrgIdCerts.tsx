import { useState, useEffect } from "react";
import axios from "axios";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from "@/components/ui/Table";

// Replace this with your actual type
export interface OrgCertificate {
    id: string;
    common_name: string;
    key_length: number;
    valid_until: string;
    is_active: boolean;
    intermediate_ca_id?: string;
}
const API_BASE_URL = "https://pre-prod.be.anchorvpn.net/api/v1"; // adjust if needed

// Helper functions
const daysRemaining = (date: string | number | Date) => {
    const now = new Date();
    const target = new Date(date);
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const getStatusStyles = (isActive: boolean, days: number) => {
    if (!isActive) return { text: "Inactive", className: "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200" };
    if (days <= 30) return { text: "Expiring Soon", className: "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200" };
    return { text: "Active", className: "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200" };
};

// Custom hook
export const useOrgIdCertificates = (orgId: string) => {
    const [orgIdCerts, setOrgIdCerts] = useState<OrgCertificate[]>([]);
    const [loadingOrgIdCerts, setLoadingOrgIdCerts] = useState(false);
    const [orgIdError, setOrgIdError] = useState("");

    const fetchOrgIdCerts = async () => {
        if (!orgId || !orgId.trim()) {
            setOrgIdError("Please enter a valid organization ID.");
            setOrgIdCerts([]);
            return;
        }

        setOrgIdError("");
        setLoadingOrgIdCerts(true);

        try {
            const res = await axios.get(`${API_BASE_URL}/organizations/${orgId.trim()}/certificates/`);
            setOrgIdCerts(res.data as OrgCertificate[]);
        } catch (err: any) {
            setOrgIdError("Failed to fetch certificates for this organization.");
            setOrgIdCerts([]);
        } finally {
            setLoadingOrgIdCerts(false);
        }
    };

    useEffect(() => {
        fetchOrgIdCerts();
    }, [orgId]);

    const renderOrgIdCertificates = () => {
        if (loadingOrgIdCerts) return <div className="text-gray-800 dark:text-gray-200">Loading certificates…</div>;
        if (orgIdError) return <div className="text-red-200 dark:text-red-400">{orgIdError}</div>;
        if (orgIdCerts.length === 0) return <div className="text-gray-600 dark:text-gray-400">No certificates found for this organization.</div>;

        return (
            <div className="py-6 flex justify-center">
                <Table className="w-[90%] border border-gray-300 dark:border-gray-700 rounded-xl shadow bg-white dark:bg-gray-900">
                    <TableHeader className="bg-gray-100 dark:bg-gray-800 text-lg">
                        <TableRow>
                            <TableHead className="border dark:border-gray-700">Status</TableHead>
                            <TableHead className="border dark:border-gray-700">ID</TableHead>
                            <TableHead className="border dark:border-gray-700">Common Name</TableHead>
                            <TableHead className="border dark:border-gray-700">Key</TableHead>
                            <TableHead className="border dark:border-gray-700">Valid Until</TableHead>
                            <TableHead className="border dark:border-gray-700">Intermediate CA</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="text-lg">
                        {orgIdCerts.map(cert => {
                            const days = daysRemaining(cert.valid_until);
                            const status = getStatusStyles(cert.is_active, days);

                            return (
                                <TableRow key={cert.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">

                                    <TableCell className="border dark:border-gray-700">
                                        <span className={`px-3 py-1 rounded text-sm font-semibold ${status.className}`}>
                                            {status.text}
                                        </span>
                                    </TableCell>

                                    <TableCell className="border dark:border-gray-700 font-bold">
                                        {cert.id}
                                    </TableCell>

                                    <TableCell className="border dark:border-gray-700 text-blue-900 dark:text-blue-400 font-bold">
                                        {cert.common_name}
                                    </TableCell>

                                    <TableCell className="border dark:border-gray-700">
                                        {cert.key_length} bits
                                    </TableCell>

                                    <TableCell className={`border dark:border-gray-700 font-semibold ${days <= 30 ? "text-red-600 dark:text-red-400" : "text-green-700 dark:text-green-300"}`}>
                                        {new Date(cert.valid_until).toISOString().split("T")[0]}
                                    </TableCell>

                                    <TableCell className="border dark:border-gray-700">
                                        {cert.intermediate_ca_id || "—"}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

            </div>
        );
    };

    return { orgId, orgIdCerts, loadingOrgIdCerts, orgIdError, fetchOrgIdCerts, renderOrgIdCertificates };
};
