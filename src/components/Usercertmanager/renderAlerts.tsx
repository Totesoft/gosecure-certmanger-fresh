import React from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface RenderAlertsProps {
    certs: any[];
    intermediates: Record<string, any[]>;
    loading: boolean;
    error: string | null;
    daysRemaining: (date: string) => number;
}

const RenderAlerts: React.FC<RenderAlertsProps> = ({
    certs,
    intermediates,
    loading, error

}) => {

    const formatDate = (d: string) => new Date(d).toLocaleDateString();

    const daysRemaining = (validUntil: string | number | Date) => {
        const diff = new Date(validUntil).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const getStatusStyles = (isActive: boolean | undefined, remainingDays: number) => {
        if (!isActive)
            return { text: "Inactive", icon: <Clock size={16} />, className: "bg-gray-200 text-gray-600" };
        if (remainingDays <= 10)
            return { text: "Expiring Soon", icon: <AlertTriangle size={16} />, className: "bg-red-100 text-red-700" };
        if (remainingDays <= 30)
            return { text: "Warning", icon: <AlertTriangle size={16} />, className: "bg-yellow-100 text-yellow-700" };
        return { text: "Active", icon: <CheckCircle size={16} />, className: "bg-green-100 text-green-700" };
    };
    const EXPIRY_THRESHOLD = 1500;

    if (loading)
        return <p className="p-6 mt-4 bg-card text-card-foreground rounded-xl shadow-lg">Loading certificates...</p>;

    if (error)
        return <p className="p-6 mt-4 bg-card text-card-foreground rounded-xl shadow-lg">{error}</p>;

    if (!certs || certs.length === 0)
        return (
            <p className="p-6 mt-4 bg-card text-card-foreground rounded-xl shadow-lg">
                No certificates found.
            </p>
        );

    return (
        <div className="space-y-6 w-[90%] mx-auto p-6 mt-4 bg-card text-card-foreground rounded-xl shadow-lg">
            <h3 className="p-6 mt-4 bg-card text-red-600 dark:text-red-400 rounded-xl shadow-lg text-3xl font-bold mb-8 text-center">
                Expiring Certificates
            </h3>

            <table className="min-w-full border border-border rounded-xl shadow bg-card text-card-foreground">
                <thead className="text-lg text-primary-foreground">
                    <tr>
                        <th className="bg-red-500 px-6 py-3 text-left w-1/3">Root CA</th>
                        <th className="bg-red-500 px-6 py-3 text-left w-1/3">Intermediate CAs</th>
                        <th className="bg-red-500 px-6 py-3 text-left w-1/3">Issued Certificates</th>
                    </tr>
                </thead>

                <tbody>
                    {certs.map((rootCa) => {
                        const rootRemaining = daysRemaining(rootCa.valid_until);
                        const intList = intermediates[rootCa.id] || [];

                        const rootExpiring = rootRemaining <= 1500;
                        const intermediateExpiring = intList.some(
                            (int) => daysRemaining(int.valid_until) <= 1500
                        );

                        const issuedExpiring = intList.some((int) =>
                            int.issued_certificates?.some(
                                (leaf) => daysRemaining(leaf.valid_until) <= 1500
                            )
                        );

                        if (!rootExpiring && !intermediateExpiring && !issuedExpiring)
                            return null;

                        return (
                            <tr key={rootCa.id} className="align-top hover:bg-muted">

                                <td className="border border-border px-6 py-6 align-top">
                                    {rootExpiring ? (
                                        <div className="space-y-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                                            <div className="text-2xl font-bold text-destructive">
                                                {rootCa.common_name}
                                            </div>
                                            <div className="text-lg text-muted-foreground">
                                                ID: {rootCa.id}
                                            </div>
                                            <div className="text-lg text-destructive font-semibold">
                                                Expires: {new Date(rootCa.valid_until).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="italic text-muted-foreground">No expiring root CA.</p>
                                    )}
                                </td>

                                <td className="border border-border px-6 py-6 align-top">
                                    {intList
                                        .filter((int) => daysRemaining(int.valid_until) <= 1500)
                                        .map((int) => (
                                            <div
                                                key={int.id}
                                                className="mb-4 p-4 bg-warning/10 border border-warning/30 rounded-lg"
                                            >
                                                <div className="text-xl font-semibold text-warning">
                                                    {int.common_name}
                                                </div>
                                                <div className="text-lg text-muted-foreground">ID: {int.id}</div>
                                                <div className="text-lg text-destructive font-semibold">
                                                    Expires: {new Date(int.valid_until).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}

                                    {intList.filter((int) => daysRemaining(int.valid_until) <= 1500).length === 0 && (
                                        <p className="italic text-muted-foreground">No expiring intermediates.</p>
                                    )}
                                </td>

                                <td className="border border-border px-6 py-6 align-top">
                                    {intList.map((int) =>
                                        int.issued_certificates
                                            ?.filter((leaf) => daysRemaining(leaf.valid_until) <= 1500)
                                            .map((leaf) => (
                                                <div
                                                    key={leaf.id}
                                                    className="mb-4 p-4 bg-yellow-200/20 border border-yellow-300/30 rounded-lg"
                                                >
                                                    <div className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">
                                                        {leaf.common_name}
                                                    </div>
                                                    <div className="text-lg text-muted-foreground">ID: {leaf.id}</div>
                                                    <div className="text-lg text-destructive font-semibold">
                                                        Expires: {new Date(leaf.valid_until).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))
                                    )}

                                    {intList.every(
                                        (int) =>
                                            !int.issued_certificates?.some(
                                                (leaf) => daysRemaining(leaf.valid_until) <= 1500
                                            )
                                    ) && (
                                            <p className="italic text-muted-foreground">No expiring issued certs.</p>
                                        )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default RenderAlerts;
