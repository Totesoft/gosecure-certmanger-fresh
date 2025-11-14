import { Routes, Route, Link } from "react-router-dom";
import CertsHome from "../pages/CertsHome";
import UserCertmanager from "@/pages/UserCertmanager";
// import OvpnGenerator from "@/pages/vpn";
//import RootCADetail from "@/pages/rootcadetail-form";
//import RootCADetail from "@/features/certs/forms/rootcadetail-form";
// import Home from "@/pages/Home";
// import RootCADetail from "@/pages/CertViewer-form";
// import RootCert from "@/pages/RootCert";
// import IntermediateCert from "@/pages/IntermediateCert";
// import UserCert from "@/pages/UserCert";
import TestAPI from "@/pages/testapipage";
//import VPNmonitoring from "@/pages/VPNmonitoring";
import VPNDashboard from "@/pages/vpndashboard"
// import API from "@/pages/Home";
// import rootCAlist from "@/pages/rootCAlist";
// import RootCAlistAdmn from "@/pages/rootCAlistAdmn";

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
      <Route path="/certdashboard" element={<UserCertmanager />} />
      <Route path="/vpndashboard" element={<VPNDashboard />} />






      <Route path="*" element={<NotFound />} />
    </Routes >
  );
}
