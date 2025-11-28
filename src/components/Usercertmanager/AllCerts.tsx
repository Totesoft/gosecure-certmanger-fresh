import React, { useEffect, useState } from "react";
import axios from "axios";

const [rootallcerts, setRootallcerts] = useState<RootCertificate[]>([]);
const [intermediateallcerts, setIntermediateallcerts] = useState<IntermediateCertificate[]>([]);
const [issuedallcerts, setIssuedallcerts] = useState<LeafCertificate[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const API_BASE_URL = "https://pre-prod.be.anchorvpn.net/api/v1"; // adjust if needed

export interface LeafCertificate {
    id: number;
    intermediate_ca_id: number;
    common_name: string;
    certificate_type: string;   // "server" | "user" | etc.
    key_length: number;
    valid_from: string;         // ISO datetime
    valid_until: string;        // ISO datetime
    serial_number: string;
    is_active: boolean;
    created_at: string;         // ISO datetime
}

export interface IntermediateCertificate {
    id: number;
    root_ca_id: number;
    common_name: string;
    key_length: number;
    valid_from: string;       // ISO datetime
    valid_until: string;      // ISO datetime
    serial_number: string;
    is_active: boolean;
    created_at: string;       // ISO datetime

    issued_certificates?: LeafCertificate[];
}

export interface RootCertificate {
    id: number;
    organization_id: number;
    common_name: string;
    key_length: number;
    valid_from: string;      // ISO datetime
    valid_until: string;     // ISO datetime
    serial_number: string;
    is_active: boolean;
    created_at: string;      // ISO datetime
    intermediates?: IntermediateCertificate[];
}

export interface ServerCertificate {
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

export interface UserCertificate {
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
// type ExpandState = Record<string, boolean>;


export const fetchallcerts = async () => {
    setLoading(true);
    setError("");

    try {
        console.log("Calling Certificate APIs...");

        const results = await Promise.allSettled([
            axios.get(`${API_BASE_URL}/root-cas/`),
            axios.get(`${API_BASE_URL}/intermediate-ca/`),
            axios.get(`${API_BASE_URL}/certificates/`)
        ]);

        // ROOT CA
        if (results[0].status === "fulfilled") {
            setRootallcerts(results[0].value.data);
        } else {
            console.warn("Root CA API failed:", results[0].reason);
        }

        // INTERMEDIATE CA
        if (results[1].status === "fulfilled") {
            setIntermediateallcerts(results[1].value.data);
        } else {
            console.warn("Intermediate CA API failed:", results[1].reason);
        }

        // ISSUED CERTIFICATES
        if (results[2].status === "fulfilled") {
            setIssuedallcerts(results[2].value.data);
        } else {
            console.warn("Issued certs API failed:", results[2].reason);
        }

    } catch (err) {
        console.error("Unexpected error:", err);
        setError("Unexpected error occurred when fetching certificates.");
    } finally {
        setLoading(false);
    }
};

export const renderRootallTable = () => (
    <table className="w-[75%] mx-auto border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-100">
            <tr>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Common Name</th>
                <th className="px-4 py-2 border">Valid Until</th>
                <th className="px-4 py-2 border">Actions</th>
            </tr>
        </thead>

        <tbody>
            {rootallcerts.map((cert) => {
                const days = daysRemaining(cert.valid_until);
                const status = getStatusStyles(cert.is_active, days);

                return (
                    <tr key={cert.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">
                            <span className={`px-2 py-1 rounded text-sm ${status.className}`}>
                                {status.text}
                            </span>
                        </td>
                        <td className="px-4 py-2 border">{cert.id}</td>
                        <td className="px-4 py-2 border">{cert.common_name}</td>
                        <td className="px-4 py-2 border">
                            {new Date(cert.valid_until).toISOString().split("T")[0]}
                        </td>
                        <td className="px-4 py-2 border">
                            <button className="underline text-blue-500">Download</button>
                        </td>
                    </tr>
                );
            })}
        </tbody>
    </table>
);

export const renderIntermediateallTable = () => (
    <table className="w-[75%] mx-auto border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-100">
            <tr>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Common Name</th>
                <th className="px-4 py-2 border">Valid Until</th>
                <th className="px-4 py-2 border">Actions</th>
            </tr>
        </thead>

        <tbody>
            {intermediateallcerts.map((cert) => {
                const days = daysRemaining(cert.valid_until);
                const status = getStatusStyles(cert.is_active, days);

                return (
                    <tr key={cert.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">
                            <span className={`px-2 py-1 rounded text-sm ${status.className}`}>
                                {status.text}
                            </span>
                        </td>
                        <td className="px-4 py-2 border">{cert.id}</td>
                        <td className="px-4 py-2 border">{cert.common_name}</td>
                        <td className="px-4 py-2 border">
                            {new Date(cert.valid_until).toISOString().split("T")[0]}
                        </td>
                        <td className="px-4 py-2 border">
                            <button className="underline text-blue-500">Download</button>
                        </td>
                    </tr>
                );
            })}
        </tbody>
    </table>
);
export const renderIssuedCertsallTable = () => (
    <table className="w-[75%] mx-auto border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-100">
            <tr>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Common Name</th>
                <th className="px-4 py-2 border">Valid Until</th>
                <th className="px-4 py-2 border">Actions</th>
            </tr>
        </thead>

        <tbody>
            {issuedallcerts.map((cert) => {
                const days = daysRemaining(cert.valid_until);
                const status = getStatusStyles(cert.is_active, days);

                return (
                    <tr key={cert.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">
                            <span className={`px-2 py-1 rounded text-sm ${status.className}`}>
                                {status.text}
                            </span>
                        </td>
                        <td className="px-4 py-2 border">{cert.id}</td>
                        <td className="px-4 py-2 border">{cert.common_name}</td>
                        <td className="px-4 py-2 border">
                            {new Date(cert.valid_until).toISOString().split("T")[0]}
                        </td>
                        <td className="px-4 py-2 border">
                            <button className="underline text-blue-500">Download</button>
                        </td>
                    </tr>
                );
            })}
        </tbody>
    </table>
);


