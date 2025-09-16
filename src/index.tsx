// src/index.ts
import type { RouteObject } from 'react-router-dom'
// Make sure CertsPage.tsx exists in ./pages or update the path accordingly
import  CertsHome from "@/pages/CertsHome";

export const routes: RouteObject[] = [
  { path: "/certs", element: <CertsHome /> }
];
