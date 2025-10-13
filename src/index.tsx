// src/index.ts
import type { RouteObject } from 'react-router-dom'
// Make sure CertsPage.tsx exists in ./pages or update the path accordingly
import CertsHome from "@/pages/CertsHome";
import RootCert from "@/pages/RootCert";
import IntermediateCert from "@/pages/IntermediateCert";
import UserCert from "@/pages/UserCert";
//import RootCADetail from './features/certs/forms/rootcadetail-form';
import RootCADetail from '@/pages/CertViewer-form';
import CertmanagerDashboard from './pages/CertmanagerDashboard';
import Home from './pages/Home';
import VPNMonitoring from './pages/VPNmonitoring';



export const routes: RouteObject[] = [
  { path: "/certs", element: <CertsHome /> },
  { path: "/certs/home", element: <Home /> },
  { path: "/certs/root", element: < RootCert /> },

  { path: "/certs/intermediate", element: <IntermediateCert /> },

  { path: "/certs/user", element: <UserCert /> },
  { path: "/certs/rootca", element: <RootCADetail /> }
   { path: "/certs/certdashboard", element: <CertmanagerDashboard /> }
   { path: "/certs/vpnmonitoring", element: <VPNMonitoring /> }


];
