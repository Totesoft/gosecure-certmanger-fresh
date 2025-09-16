import { Routes, Route, Link } from "react-router-dom";
import CertsHome from "../pages/CertsHome";
import Dashboard from "@/pages/Dashboard";
import OvpnGenerator from "@/pages/vpn";
import RootCADetail from "@/pages/rootcadetail-form";

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
      <Route path="/" element={<CertsHome />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ovpn" element={<OvpnGenerator />} />
      <Route path="/root" element={<RootCADetail cert={{
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
      {/* Add more nested routes under /certs here */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
