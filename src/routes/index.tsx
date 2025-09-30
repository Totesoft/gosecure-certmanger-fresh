import { Routes, Route, Link } from "react-router-dom";
import CertsHome from "../pages/CertsHome";
import Dashboard from "@/pages/Dashboard";
import OvpnGenerator from "@/pages/vpn";
import RootCADetail from "@/features/certs/forms/rootcadetail-form";


import RootCert from "@/pages/RootCert";
import IntermediateCert from "@/pages/IntermediateCert";
import UserCert from "@/pages/UserCert";
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import TestAPI from "@/pages/testapipage";
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
import Home from "@/pages/Home";

>>>>>>> Stashed changes
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
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ovpn" element={<OvpnGenerator />} />
      {/* Add more nested routes under /certs here */}
      <Route path="/certs/home" element={<Home />} />
      <Route path="/certs/root" element={<RootCert />} />
      <Route path="/certs/intermediate" element={<IntermediateCert />} />
      <Route path="/certs/user" element={<UserCert />} />
      <Route path="/certs/rootca" element={<RootCADetail />} />
      <Route path="/certs/testapi" element={<TestAPI />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
