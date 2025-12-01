import { useState, useCallback } from "react";
import axios from "axios";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { issuedcertsmockdata, intermediatemockdata, rootCAmockdata } from "@/pages/AdmnCertmanagerMockdata";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { token } from "@/components/token"

const API_BASE_URL = "https://pre-prod.be.anchorvpn.net/api/v1";

export interface LeafCertificate {
    id: number;
    intermediate_ca_id: number;
    common_name: string;
    certificate_type: string;
    key_length: number;
    valid_from: string;
    valid_until: string;
    serial_number: string;
    is_active: boolean;
    created_at: string;
}

export interface IntermediateCertificate {
    id: number;
    root_ca_id: number;
    common_name: string;
    key_length: number;
    valid_from: string;
    valid_until: string;
    serial_number: string;
    is_active: boolean;
    created_at: string;
    issued_certificates?: LeafCertificate[];
}

export interface RootCertificate {
    id: number;
    organization_id: number;
    common_name: string;
    key_length: number;
    valid_from: string;
    valid_until: string;
    serial_number: string;
    is_active: boolean;
    created_at: string;
    intermediates?: IntermediateCertificate[];
}

export const useAllCerts = () => {
    const [rootallcerts, setRootallcerts] = useState<RootCertificate[]>([]);
    const [intermediateallcerts, setIntermediateallcerts] = useState<IntermediateCertificate[]>([]);
    const [issuedallcerts, setIssuedallcerts] = useState<LeafCertificate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllCerts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("Calling Certificate APIs...");

            const results = await Promise.allSettled([

                axios.get(`${API_BASE_URL}/root-cas/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }),
                axios.get(`${API_BASE_URL}/intermediate-ca/`),
                axios.get(`${API_BASE_URL}/certificates/`)
            ]);

            if (results[0].status === "fulfilled") {
                setRootallcerts(results[0].value.data);
            } else {
                console.warn("Root CA API failed:", results[0].reason);
            }

            if (results[1].status === "fulfilled") {
                setIntermediateallcerts(results[1].value.data);
            } else {
                console.warn("Intermediate CA API failed:", results[1].reason);
            }

            if (results[2].status === "fulfilled") {
                setIssuedallcerts(results[2].value.data);
            } else {
                console.warn("Issued certs API failed:", results[2].reason);
            }

            /////// MOCK DATA (remove later)
            // const rootallRes = rootCAmockdata;
            // const intermediateallRes = intermediatemockdata;
            // const issuedcertsallRes = issuedcertsmockdata;
            // setRootallcerts(rootallRes);
            // setIntermediateallcerts(intermediateallRes);
            // setIssuedallcerts(issuedcertsallRes);

        } catch (err) {
            console.error("Unexpected error:", err);
            setError("Unexpected error occurred when fetching certificates.");
        } finally {
            setLoading(false);
        }
    }, []);


    const daysRemaining = (validUntil: string | number | Date) => {
        const diff = new Date(validUntil).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const getStatusStyles = (isActive: boolean, days: number) => {
        if (!isActive) return { text: "Inactive", className: "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200" };
        if (days <= 30) return { text: "Expiring Soon", className: "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200" };
        return { text: "Active", className: "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200" };
    };

    const renderRootallTable = () => (
        <div className="w-[75%] mx-auto border border-gray-300 rounded-lg shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-800">
                        <TableHead className="border-r dark:border-gray-700 font-semibold text-gray-900 dark:text-gray-100">
                            Status
                        </TableHead>
                        <TableHead className="border-r dark:border-gray-700 font-semibold">
                            ID
                        </TableHead>
                        <TableHead className="border-r dark:border-gray-700 font-semibold">
                            Common Name
                        </TableHead>
                        <TableHead className="border-r dark:border-gray-700 font-semibold">
                            Valid Until
                        </TableHead>
                        <TableHead className="font-semibold">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody className="text-lg">
                    {rootallcerts.map((cert) => {
                        const days = daysRemaining(cert.valid_until);
                        const status = getStatusStyles(cert.is_active, days);

                        return (
                            <TableRow
                                key={cert.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                {/* STATUS */}
                                <TableCell className="border-r dark:border-gray-700">
                                    <span
                                        className={`px-3 py-1 rounded text-sm font-semibold ${status.className}`}
                                    >
                                        {status.text}
                                    </span>
                                </TableCell>

                                {/* ID */}
                                <TableCell className="border-r dark:border-gray-700 font-bold">
                                    {cert.id}
                                </TableCell>

                                {/* COMMON NAME */}
                                <TableCell className="border-r dark:border-gray-700 font-bold text-blue-900 dark:text-blue-400">
                                    {cert.common_name}
                                </TableCell>

                                {/* VALID UNTIL */}
                                <TableCell
                                    className={`border-r dark:border-gray-700 font-semibold ${days <= 30
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-green-700 dark:text-green-300"
                                        }`}
                                >
                                    {new Date(cert.valid_until).toISOString().split("T")[0]}
                                </TableCell>

                                {/* ACTIONS */}
                                <TableCell>
                                    <button className="underline text-blue-600 dark:text-blue-400">
                                        Download
                                    </button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );


    const renderIntermediateallTable = () => (
        <div className="w-[75%] mx-auto border border-gray-300 rounded-lg shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-800">
                        <TableHead className="border-r dark:border-gray-700 font-semibold text-gray-900 dark:text-gray-100">
                            Status
                        </TableHead>
                        <TableHead className="border-r dark:border-gray-700 font-semibold">
                            ID
                        </TableHead>
                        <TableHead className="border-r dark:border-gray-700 font-semibold">
                            Common Name
                        </TableHead>
                        <TableHead className="border-r dark:border-gray-700 font-semibold">
                            Valid Until
                        </TableHead>
                        <TableHead className="font-semibold">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody className="text-lg">
                    {intermediateallcerts.map((cert) => {
                        const days = daysRemaining(cert.valid_until);
                        const status = getStatusStyles(cert.is_active, days);

                        return (
                            <TableRow
                                key={cert.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                {/* STATUS */}
                                <TableCell className="border-r dark:border-gray-700">
                                    <span
                                        className={`px-3 py-1 rounded text-sm font-semibold ${status.className}`}
                                    >
                                        {status.text}
                                    </span>
                                </TableCell>

                                {/* ID */}
                                <TableCell className="border-r dark:border-gray-700 font-bold">
                                    {cert.id}
                                </TableCell>

                                {/* COMMON NAME */}
                                <TableCell className="border-r dark:border-gray-700 font-bold text-blue-900 dark:text-blue-400">
                                    {cert.common_name}
                                </TableCell>

                                {/* VALID UNTIL */}
                                <TableCell
                                    className={`border-r dark:border-gray-700 font-semibold ${days <= 30
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-green-700 dark:text-green-300"
                                        }`}
                                >
                                    {new Date(cert.valid_until).toISOString().split("T")[0]}
                                </TableCell>

                                {/* ACTIONS */}
                                <TableCell>
                                    <button className="underline text-blue-600 dark:text-blue-400">
                                        Download
                                    </button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );

    const renderIssuedCertsallTable = () => (
        <div className="w-[75%] mx-auto border border-gray-300 rounded-lg shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-800">
                        <TableHead className="border-r dark:border-gray-700 font-semibold text-gray-900 dark:text-gray-100">
                            Status
                        </TableHead>
                        <TableHead className="border-r dark:border-gray-700 font-semibold">
                            ID
                        </TableHead>
                        <TableHead className="border-r dark:border-gray-700 font-semibold">
                            Common Name
                        </TableHead>
                        <TableHead className="border-r dark:border-gray-700 font-semibold">
                            Valid Until
                        </TableHead>
                        <TableHead className="font-semibold">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody className="text-lg">
                    {issuedallcerts.map((cert) => {
                        const days = daysRemaining(cert.valid_until);
                        const status = getStatusStyles(cert.is_active, days);

                        return (
                            <TableRow
                                key={cert.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                {/* STATUS */}
                                <TableCell className="border-r dark:border-gray-700">
                                    <span
                                        className={`px-3 py-1 rounded text-sm font-semibold ${status.className}`}
                                    >
                                        {status.text}
                                    </span>
                                </TableCell>

                                {/* ID */}
                                <TableCell className="border-r dark:border-gray-700 font-bold">
                                    {cert.id}
                                </TableCell>

                                {/* COMMON NAME */}
                                <TableCell className="border-r dark:border-gray-700 font-bold text-blue-900 dark:text-blue-400">
                                    {cert.common_name}
                                </TableCell>

                                {/* VALID UNTIL */}
                                <TableCell
                                    className={`border-r dark:border-gray-700 font-semibold ${days <= 30
                                            ? "text-red-600 dark:text-red-400"
                                            : "text-green-700 dark:text-green-300"
                                        }`}
                                >
                                    {new Date(cert.valid_until).toISOString().split("T")[0]}
                                </TableCell>

                                {/* ACTIONS */}
                                <TableCell>
                                    <button className="underline text-blue-600 dark:text-blue-400">
                                        Download
                                    </button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );





    return {
        renderRootallTable,
        renderIntermediateallTable,
        renderIssuedCertsallTable,
        //loading,
        // error,
        fetchAllCerts
    };
};

