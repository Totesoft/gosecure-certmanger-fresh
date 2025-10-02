import { Routes, Route, Link } from "react-router-dom";
import CertsHome from "../pages/CertsHome";
//import Dashboard from "@/pages/Dashboard";
//import OvpnGenerator from "@/pages/vpn";
import RootCADetail from "@/pages/CertViewer-form";
import RootCert from "@/pages/RootCert";
import IntermediateCert from "@/pages/IntermediateCert";
import UserCert from "@/pages/UserCert";
import Home from "@/pages/Home";


function NotFound() {
  return (
    <div className="p-4">
      <p className="text-gray-600">Not found.</p>
      <Link to="/certs" className="text-blue-600 underline">
        Back
      </Link>
    </div>
  );
}

export default function CertsRoutes() {
  return (
    <Routes>
      <Route path="/certs" element={<CertsHome />} />
      {/* <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ovpn" element={<OvpnGenerator />} /> */}
      {/* Add more nested routes under /certs here */}
      <Route path="/certs/home" element={<Home />} /> 
      <Route path="/certs/root" element={<RootCert />} />
      <Route path="/certs/intermediate" element={<IntermediateCert />} />
      <Route path="/certs/user" element={<UserCert />} />
      <Route path="/certs/rootca" element={<RootCADetail cert={{
        subject_cn: "",
        subject_o: undefined,
        subject_ou: undefined,
        issuer_cn: "",
        issuer_o: undefined,
        issuer_ou: undefined,
        not_before: "",
        not_after: "",
        sha256_fingerprint: "",
        public_key_sha256: "",
        pem_cert: ""
      }} />} />
    


      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
