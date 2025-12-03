import React, { useState } from "react";

interface RenderAlertsProps {
    certs: any[];
    intermediates: Record<string, any[]>;
    loading: boolean;
    error: string | null;
    orgId: string;
    setOrgId: React.Dispatch<React.SetStateAction<string>>;
}

const RenderAlerts: React.FC<RenderAlertsProps> = ({
    certs,
    intermediates,
    loading,
    error,
    orgId
}) => {
    const [expiryThreshold, setExpiryThreshold] = useState(30);

    const daysRemaining = (validUntil: string | number | Date) => {
        const diff = new Date(validUntil).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    if (loading)
        return (
            <p className="p-6 mt-4 rounded-xl shadow-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                Loading certificates...
            </p>
        );

    if (error)
        return (
            <p className="p-6 mt-4 rounded-xl shadow-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                {error}
            </p>
        );

    if (!certs || certs.length === 0)
        return (
            <p className="p-6 mt-4 rounded-xl shadow-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                No certificates found.
            </p>
        );

    return (
        <div className="w-[90%] mx-auto p-4 mt-4 rounded-xl shadow-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Threshold input */}
            <div className="mb-4 flex justify-center items-center">
                <label className="font-semibold mr-2 text-blue-700 dark:text-blue-400">
                    Expiry Threshold (days):
                </label>
                <input
                    type="number"
                    min={1}
                    value={expiryThreshold}
                    onChange={(e) => setExpiryThreshold(Number(e.target.value))}
                    className="border px-2 py-1 rounded w-20 
                               bg-blue-50 dark:bg-blue-900 
                               text-blue-900 dark:text-blue-200 
                               border-blue-300 dark:border-blue-700"
                />
            </div>

            <h3 className="p-2 mt-4 mb-4 rounded-xl text-3xl font-bold text-center 
                           bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-200">
                Expiring Certificates for {orgId}
            </h3>

            <table
                className="min-w-full border rounded-xl shadow overflow-hidden"
                style={{
                    borderColor: "var(--border-color)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)"
                }}
            >
                <thead className="text-lg">
                    <tr>
                        <th style={{ backgroundColor: "var(--accent-primary)", color: "var(--text-on-accent)" }} className="px-6 py-3 text-left w-1/3">Root CA</th>
                        <th style={{ backgroundColor: "var(--accent-primary)", color: "var(--text-on-accent)" }} className="px-6 py-3 text-left w-1/3">Intermediate CAs</th>
                        <th style={{ backgroundColor: "var(--accent-primary)", color: "var(--text-on-accent)" }} className="px-6 py-3 text-left w-1/3">Issued Certificates</th>
                    </tr>
                </thead>


                <tbody>
                    {certs.map((rootCa) => {
                        const rootRemaining = daysRemaining(rootCa.valid_until);
                        const intList = intermediates[rootCa.id] || [];

                        const rootExpiring = rootRemaining <= expiryThreshold;
                        const intermediateExpiring = intList.some(int => daysRemaining(int.valid_until) <= expiryThreshold);
                        const issuedExpiring = intList.some(int =>
                            int.issued_certificates?.some((leaf: { valid_until: string | number | Date; }) => daysRemaining(leaf.valid_until) <= expiryThreshold)
                        );

                        if (!rootExpiring && !intermediateExpiring && !issuedExpiring) return null;

                        return (
                            <tr key={rootCa.id} className="align-top hover:bg-gray-50 dark:hover:bg-gray-700">
                                {/* ROOT CA */}
                                <td className="border border-gray-300 dark:border-gray-700 px-6 py-6 align-top">
                                    {rootExpiring ? (
                                        <div className="space-y-2 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
                                            <div className="text-2xl font-bold text-red-800 dark:text-red-400">
                                                {rootCa.common_name}
                                            </div>
                                            <div className="text-lg text-gray-700 dark:text-gray-300">ID: {rootCa.id}</div>
                                            <div className="text-lg font-semibold text-red-600 dark:text-red-300">
                                                Expires: {new Date(rootCa.valid_until).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="italic text-gray-400 dark:text-gray-500">No expiring root CA.</p>
                                    )}
                                </td>

                                {/* INTERMEDIATES */}
                                <td className="border border-gray-300 dark:border-gray-700 px-6 py-6 align-top">
                                    {intList
                                        .filter(int => daysRemaining(int.valid_until) <= expiryThreshold)
                                        .map(int => (
                                            <div key={int.id} className="mb-4 p-4 bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700 rounded-lg">
                                                <div className="text-xl font-semibold text-orange-800 dark:text-orange-300">
                                                    {int.common_name}
                                                </div>
                                                <div className="text-lg text-gray-700 dark:text-gray-300">ID: {int.id}</div>
                                                <div className="text-lg font-semibold text-red-600 dark:text-red-300">
                                                    Expires: {new Date(int.valid_until).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    {intList.filter(int => daysRemaining(int.valid_until) <= expiryThreshold).length === 0 && (
                                        <p className="italic text-gray-400 dark:text-gray-500">No expiring intermediates.</p>
                                    )}
                                </td>

                                {/* ISSUED CERTIFICATES */}
                                <td className="border border-gray-300 dark:border-gray-700 px-6 py-6 align-top">
                                    {intList.flatMap(int =>
                                        int.issued_certificates
                                            ?.filter((leaf: { valid_until: string | number | Date; }) => daysRemaining(leaf.valid_until) <= expiryThreshold)
                                            .map((leaf: { id: boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.Key | null | undefined; common_name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; valid_until: string | number | Date; }) => (
                                                <div key={leaf.id} className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                                                    <div className="text-xl font-semibold text-yellow-800 dark:text-yellow-300">
                                                        {leaf.common_name}
                                                    </div>
                                                    <div className="text-lg text-gray-700 dark:text-gray-300">ID: {leaf.id}</div>
                                                    <div className="text-lg font-semibold text-red-600 dark:text-red-300">
                                                        Expires: {new Date(leaf.valid_until).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                    {intList.every(int =>
                                        !int.issued_certificates?.some(leaf => daysRemaining(leaf.valid_until) <= expiryThreshold)
                                    ) && (
                                            <p className="italic text-gray-400 dark:text-gray-500">No expiring issued certs.</p>
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
