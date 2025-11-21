/////User


export const renderUserTable = () => (
    <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-100 text-gray-700 text-lg">
            <tr>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Common Name</th>
                <th className="px-4 py-2 border">Valid Until</th>
                {/* <th className="px-4 py-2 border">Actions</th> */}
            </tr>
        </thead>

        <tbody>
            {usercerts.map((cert) => {
                const remaining = daysRemaining(cert.valid_until);
                const status = getStatusStyles(cert.is_active, remaining);

                return (
                    <tr key={cert.id} className="border-b hover:bg-gray-50">

                        {/* Status */}
                        <td className="px-4 py-2 border">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded ${status.className}`}>
                                {status.icon} {status.text}
                            </span>
                        </td>

                        {/* ID */}
                        <td className="px-4 py-2 border">{cert.id}</td>

                        {/* Common Name */}
                        <td className="px-4 py-2 border">{cert.common_name}</td>

                        {/* Valid Until — only date (YYYY-MM-DD) */}
                        <td className="px-4 py-2 border">
                            {new Date(cert.valid_until).toISOString().split("T")[0]}
                        </td>

                        {/* Actions */}
                        {/* <td className="px-4 py-2 border">
                                <button className="underline text-blue-500">
                                    Download
                                </button>
                            </td> */}

                    </tr>
                );
            })}
        </tbody>
    </table>
);
