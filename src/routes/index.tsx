import { Routes, Route, Link } from "react-router-dom";
import CertsHome from "../pages/CertsHome";
import UserCertmanager from "@/pages/UserCertmanager";
import TestAPI from "@/pages/testapipage";
import VPNDashboard from "@/pages/vpndashboard"
import AdmnCertmanager from "@/pages/AdmnCertmanager"

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
      <Route path="/certs/testapi" element={<TestAPI />} />
      <Route path="/usercertmanager" element={<UserCertmanager />} />
      <Route path="/vpndashboard" element={<VPNDashboard />} />
      <Route path="/admncertmanager" element={<AdmnCertmanager />} />






      <Route path="*" element={<NotFound />} />
    </Routes >
  );
}
