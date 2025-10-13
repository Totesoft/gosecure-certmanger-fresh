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


// export default function TestUserCertAPI() {
//     const [response, setResponse] = useState<any>(null);
//     const [error, setError] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async () => {
//         setLoading(true);
//         setError(null);

//         try {
//             const res = await fetch("https://gosecure.totesoft.com/api/v1/certificates/user", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     // "Authorization": "Bearer YOUR_TOKEN_HERE" // if the API needs auth
//                 },
//                 body: JSON.stringify({
//                     common_name: "Test User",
//                     email: "user@example.com",
//                     type: "user",
//                     username: "testuser"
//                 }),
//             });

//             if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

//             const json = await res.json();
//             setResponse(json);
//         } catch (err: any) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="p-4">
//             <button
//                 onClick={handleSubmit}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//             >
//                 Generate User Certificate
//             </button>

//             {loading && <p>Loading...</p>}
//             {error && <p className="text-red-500">Error: {error}</p>}
//             {response && (
//                 <pre className="bg-gray-100 p-4 rounded-md mt-4">
//                     {JSON.stringify(response, null, 2)}
//                 </pre>
//             )}
//         </div>
//     );
// }



// export default function CertificateList() {
//     const [certs, setCerts] = useState<any>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         async function fetchCertificates() {
//             try {
//                 const res = await fetch("https://gosecure.totesoft.com/api/v1/certificates/list", {
//                     method: "GET",
//                     headers: {
//                         "Content-Type": "application/json",
//                         // "Authorization": `Bearer ${token}`  // uncomment if needed
//                     },
//                 });

//                 if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

//                 const json = await res.json();
//                 setCerts(json);
//             } catch (err: any) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         }

//         fetchCertificates();
//     }, []);

//     if (loading) return <div>Loading certificates...</div>;
//     if (error) return <div>Error: {error}</div>;

//     return (
//         <div className="p-4 bg-background text-foreground rounded-md shadow-md">
//             <h2 className="text-xl font-bold mb-2">Certificates JSON</h2>
//             <pre className="bg-card p-4 rounded-md overflow-auto">
//                 {JSON.stringify(certs, null, 2)}
//             </pre>
//         </div>
//     );
// }




// export default function VpnMetrics() {
//     const [data, setData] = useState<any>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         async function loadMetrics() {
//             try {
//                 // If using Vite proxy, call /api instead of full URL
//                 const res = await fetch("https://gosecure.totesoft.com/api/v1/vpn/metrics", {
//                     method: "GET",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                 });

//                 if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

//                 const json = await res.json();
//                 setData(json);
//             } catch (err: any) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         }

//         loadMetrics();
//     }, []);

//     if (loading) return <div>Loading VPN metrics...</div>;
//     if (error) return <div>Error: {error}</div>;

//     return (
//         <div className="p-4 bg-background text-foreground rounded-md shadow-md">
//             <h2 className="text-xl font-bold mb-2">GoSecure VPN Metrics</h2>
//             <pre className="bg-card p-4 rounded-md overflow-auto">
//                 {JSON.stringify(data, null, 2)}
//             </pre>
//         </div>
//     );
// }




// export default function AppLogs() {
//     const [data, setData] = useState<any>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         async function loadLogs() {
//             try {
//                 const res = await fetch("https://pre-prod.be.anchorvpn.net/admin/logs/application?lines=50", {
//                     method: "GET",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                 });

//                 if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

//                 const json = await res.json();
//                 setData(json);
//             } catch (err: any) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         }

//         loadLogs();
//     }, []);

//     if (loading) return <div>Loading application logs...</div>;
//     if (error) return <div>Error: {error}</div>;

//     return (
//         <div className="p-4 bg-background text-foreground rounded-md shadow-md">
//             <h2 className="text-xl font-bold mb-2">Application Logs</h2>
//             <pre className="bg-card p-4 rounded-md overflow-auto text-sm">
//                 {JSON.stringify(data, null, 2)}
//             </pre>
//         </div>
//     );
// }



// export default function HealthCheck() {
//     const [status, setStatus] = useState(null);

//     useEffect(() => {
//         //   fetch("https://pre-prod.be.anchorvpn.net/")
//         fetch("/api/v1/monitoring/health")

//             .then(res => res.json())
//             .then(setStatus)
//             .catch(console.error);
//     }, []);

//     return <pre>{JSON.stringify(status, null, 2)}</pre>;
// }






// export default function HealthCheck() {
//     const [status, setStatus] = useState<any[]>([]); // explicitly expecting an array
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         async function loadHealth() {
//             try {
//                 const res = await fetch("/api/monitoring/health/"); // use proxy for local dev
//                 if (!res.ok) throw new Error(`HTTP error ${res.status}`);
//                 const data = await res.json();

//                 // Ensure it's always an array
//                 setStatus(Array.isArray(data) ? data : [data]);
//             } catch (err: any) {
//                 console.error("Fetch error:", err);
//                 setError(err.message);
//             }
//         }

//         loadHealth();
//     }, []);

//     if (error) return <div>Error: {error}</div>;
//     if (!status.length) return <div>Loading...</div>;

//     return (
//         <div>
//             <h2>Monitoring Services</h2>
//             <pre>{JSON.stringify(status, null, 2)}</pre>
//         </div>
//     );
// }



export default function MonitoringStatus() {
    const [status, setStatus] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStatus() {
            try {
                const response = await fetch("/api/monitoring/status", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // Add authorization if required:
                        // "Authorization": "Bearer YOUR_ACCESS_TOKEN"
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setStatus(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchStatus();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Monitoring Status</h2>
            <pre>{JSON.stringify(status, null, 2)}</pre>
        </div>
    );
}



// export default function ServerCertificates() {
//     const [certificates, setCertificates] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchCertificates = async () => {
//             try {
//                 const response = await fetch('/api/certificates/server/', {
//                     method: 'GET',
//                     headers: {
//                         'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
//                         'Content-Type': 'application/json',
//                     },
//                 });

//                 if (!response.ok) {
//                     throw new Error(`HTTP error! Status: ${response.status}`);
//                 }

//                 const data = await response.json();
//                 setCertificates(data);
//             } catch (err: any) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchCertificates();
//     }, []);

//     if (loading) return <div>Loading...</div>;
//     if (error) return <div>Error: {error}</div>;

//     return (
//         <div>
//             <h2>Server Certificates</h2>
//             <pre>{JSON.stringify(certificates, null, 2)}</pre>
//         </div>
//     );
// }

// export default function VpnMetrics() {
//     const [metrics, setMetrics] = useState<any>(null);

//     useEffect(() => {
//         async function loadMetrics() {
//             try {
//                 const res = await fetch('/api/vpn/metrics'); // proxy through Vite dev server
//                 const data = await res.text();
//                 setMetrics(data.split('\n')); // parse Prometheus-style metrics
//             } catch (err) {
//                 console.error(err);
//             }
//         }
//         loadMetrics();
//         const interval = setInterval(loadMetrics, 5000); // refresh every 5s
//         return () => clearInterval(interval);
//     }, []);

//     return (
//         <div>
//             <h2>VPN Metrics</h2>
//             {metrics ? (
//                 <pre>{metrics.join('\n')}</pre>
//             ) : (
//                 <p>Loading metrics...</p>
//             )}
//         </div>
//     );
// }



