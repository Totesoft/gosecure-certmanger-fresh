import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import CertsRoutes from "./routes";
import { Loader } from "lucide-react";
import {  motion } from "framer-motion";
import { KeycloakProviderWrapper, useKeycloak } from "gosecure-shell/KeycloakProvider";
import { LoginScreen } from "./components/LoginScreen";

export default function App(){
return(
  <KeycloakProviderWrapper>
    <AppInner/>
  </KeycloakProviderWrapper>
)
}

function AppInner() {
  const { keycloak, initialized } = useKeycloak();
  const [authCheckDone, setAuthCheckDone] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    if (!initialized || !keycloak) return;

    // Check initial authentication
    if (!keycloak.authenticated) {
      setLoggedOut(true);
    } else {
      setAuthCheckDone(true);
    }

    // Listen for logout events
    keycloak.onAuthLogout = () => {
      setAuthCheckDone(false);
      setLoggedOut(true);
    };

    // Refresh token before expiry
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => setLoggedOut(true));
    };

    return () => {
      keycloak.onAuthLogout = null;
      keycloak.onTokenExpired = null;
    };
  }, [initialized, keycloak]);


  if (!initialized) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-200 to-white p-4" >
        <div className="flex items-center gap-3 text-black text-lg font-medium"> 
          <Loader className="size-10 animate-spin" /> Loading Keycloak.... </div> </motion.div>
    );
  }

   // Show automatic login screen if logged out
  if (loggedOut) {
    return <LoginScreen keycloak={keycloak} />;
  }

  if (!authCheckDone) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-200 to-white p-4" > <div className="flex items-center gap-3 text-black text-lg font-medium"> <Loader className="size-10 animate-spin" /> Checking authentication.... </div> </motion.div>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={<CertsRoutes />} />
    </Routes>
  );
}
