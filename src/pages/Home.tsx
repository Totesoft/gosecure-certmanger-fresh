// //import { useApi } from "gosecure-shell/useApi";
// import { useEffect, useState } from "react";

// export default function HomePage() {
//   const api = useApi();
//   const [agentInfo, setAgentInfo] = useState<any>(null);

//   useEffect(() => {
//     async function fetchAgentInfo() {
//       try {
//         const res = await api.get("/v1/certificates/list");
//         setAgentInfo(res.data);
//       } catch (err) {
//         console.error("❌ Failed to fetch agent info", err);
//       }
//     }

//     fetchAgentInfo();
//   }, [api]);

//   return (
//     <div className="p-6">
//       <h2 className="mt-4 font-semibold">Agent Info API Response:</h2>
//       {agentInfo ? (
//         <pre className="bg-gray-900 text-white p-3 rounded">
//           {JSON.stringify(agentInfo, null, 2)}
//         </pre>
//       ) : (
//         "Loading agent info..."
//       )}
//     </div>
//   );
// }
