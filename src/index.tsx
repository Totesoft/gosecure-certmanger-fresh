// src/index.ts
import type { RouteObject } from 'react-router-dom'
// Make sure CertsPage.tsx exists in ./pages or update the path accordingly
import CertsHome from "@/pages/CertsHome";
import UserCertmanager from './pages/UserCertmanager';
import VPNDashboard from './pages/vpndashboard'


export const routes: RouteObject[] = [
  { path: "/certs", element: <CertsHome /> },

  { path: "/certs/certdashboard", element: <UserCertmanager /> },
  { path: "/certs/vpndashboard", element: <VPNDashboard /> },



];
