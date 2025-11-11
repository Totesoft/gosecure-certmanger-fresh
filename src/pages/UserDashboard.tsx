// components/DashboardSummary.tsx
import React, { useEffect, useState } from "react";

interface Certificate {
    id: string;
    common_name: string;
    serial_number: string;
    valid_until: string;
    is_active: boolean;
}

interface Intermediate {
    id: string;
    issued_certificates?: Certificate[];
    valid_until: string;
    is_active: boolean;
}

interface DashboardSummaryProps {
    orgId: string;
}

const daysRemaining = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function Userdashboard({ orgId }: DashboardSummaryProps) {
    const [certs, setCerts] = useState<Certificate[]>([]);
    const [intermediates, setIntermediates] = useState<Record<string, Intermediate[]>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!orgId) return;
        setLoading(true);

        const fetchData = async () => {
            try {
                const [rootRes, interRes, certRes] = await Promise.all([
                    fetch(`/api/rootcas?orgId=${orgId}`),
                    fetch(`/api/intermediates?orgId=${orgId}`),
                    fetch(`/api/certs?orgId=${orgId}`)
                ]);

                const [rootData, interData, certData] = await Promise.all([
                    rootRes.json(),
                    interRes.json(),
                    certRes.json()
                ]);

                setCerts(rootData || []);
                setIntermediates(interData || {});
                // You can store certData separately if needed
            } catch (err) {
                console.error("Error loading dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [orgId]);

    const totalRoot = certs.length;
    const totalIntermediate = Object.values(intermediates).flat().length;
    const totalIssued = Object.values(intermediates)
        .flat()
        .flatMap((i) => i.issued_certificates || []).length;
    const totalExpiring =
        certs.filter((r) => daysRemaining(r.valid_until) <= 10 && r.is_active).length +
        Object.values(intermediates)
            .flat()
            .filter((i) => daysRemaining(i.valid_until) <= 10 && i.is_active).length;

    if (loading) {
        return <div className="text-gray-600 mt-4">Loading dashboard...</div>;
    }

    return (
        <div className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white border rounded shadow-sm text-center">
                    <div className="text-sm text-gray-600">Root CAs</div>
                    <div className="text-2xl font-bold text-blue-700 mt-2">{totalRoot}</div>
                </div>
                <div className="p-4 bg-white border rounded shadow-sm text-center">
                    <div className="text-sm text-gray-600">Intermediate CAs</div>
                    <div className="text-2xl font-bold text-blue-700 mt-2">{totalIntermediate}</div>
                </div>
                <div className="p-4 bg-white border rounded shadow-sm text-center">
                    <div className="text-sm text-gray-600">Issued Certificates</div>
                    <div className="text-2xl font-bold text-blue-700 mt-2">{totalIssued}</div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white border rounded shadow-sm text-center">
                    <div className="text-sm text-gray-600">Expiring Soon (≤10 days)</div>
                    <div className="text-2xl font-bold text-red-600 mt-2">{totalExpiring}</div>
                </div>
                <div className="p-4 bg-white border rounded shadow-sm text-center">
                    <div className="text-sm text-gray-600">Organization</div>
                    <div className="text-2xl font-bold text-blue-700 mt-2">{orgId}</div>
                </div>
                <div className="p-4 bg-white border rounded shadow-sm text-center">
                    <div className="text-sm text-gray-600">Last Update</div>
                    <div className="text-xs text-gray-600 mt-2">{new Date().toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
}
