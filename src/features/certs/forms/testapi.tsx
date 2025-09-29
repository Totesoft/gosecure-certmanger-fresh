import React, { useEffect, useState } from "react";

// export default function TestAPI() {
//     const [data, setData] = useState<any>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         async function fetchAgent() {
//             try {
//                 const response = await fetch("https://gosecure.totesoft.com/api/v1/agent/info", {
//                     method: "GET",
//                     headers: {
//                         "Content-Type": "application/json",
//                         // "Authorization": "Bearer YOUR_TOKEN_HERE" // if needed
//                     },
//                 });

//                 if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

//                 const json = await response.json();
//                 setData(json);
//             } catch (err: any) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         }

//         fetchAgent();
//     }, []);

//     if (loading) return <div>Loading agent info...</div>;
//     if (error) return <div>Error: {error}</div>;

//     return (
//         <div className="p-4 bg-background text-foreground rounded-md shadow-md">
//             <h2 className="text-xl font-bold mb-2">GoSecure Agent Info</h2>
//             <pre className="bg-card p-4 rounded-md overflow-auto">
//                 {JSON.stringify(data, null, 2)}
//             </pre>
//         </div>
//     );
// }


export default function TestUserCertAPI() {
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("https://gosecure.totesoft.com/api/v1/certificates/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": "Bearer YOUR_TOKEN_HERE" // if the API needs auth
                },
                body: JSON.stringify({
                    common_name: "Test User",
                    email: "user@example.com",
                    type: "user",
                    username: "testuser"
                }),
            });

            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

            const json = await res.json();
            setResponse(json);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                Generate User Certificate
            </button>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {response && (
                <pre className="bg-gray-100 p-4 rounded-md mt-4">
                    {JSON.stringify(response, null, 2)}
                </pre>
            )}
        </div>
    );
}