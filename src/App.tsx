import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import CertsRoutes from "./routes";
import { Loader } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeProvider } from "./context/ThemeContext";
//import { KeycloakProviderWrapper, useKeycloak } from "gosecure-shell/KeycloakProvider";

export default function App() {
  return (
    //  <KeycloakProviderWrapper>
    <AppInner />
    //  </KeycloakProviderWrapper>
  );
}

function AppInner() {
  // const { keycloak, initialized } = useKeycloak();
  // const [authCheckDone, setAuthCheckDone] = useState(false);

  //  useEffect(() => {
  //   if (!initialized || !keycloak) return;

  //   // Keycloak is ready
  //   if (!keycloak.authenticated) {
  //     // ✅ Redirect to Keycloak login page
  //     keycloak.login();
  //   } else {
  //     setAuthCheckDone(true);
  //   }

  //   // Listen for logout
  //   keycloak.onAuthLogout = () => {
  //     keycloak.login(); // redirect immediately
  //   };

  //   keycloak.onTokenExpired = () => {
  //     keycloak.updateToken(30).catch(() => keycloak.login());
  //   };

  //   return () => {
  //     keycloak.onAuthLogout = null;
  //     keycloak.onTokenExpired = null;
  //   };
  // }, [initialized, keycloak]);

  // if (!initialized || !authCheckDone) {
  //   return (
  //     <motion.div
  //       initial={{ opacity: 0 }}
  //       animate={{ opacity: 1 }}
  //       className="flex-1 flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-200 to-white p-4"
  //     >
  //       <div className="flex items-center gap-3 text-black text-lg font-medium">
  //         <Loader className="size-10 animate-spin" /> Redirecting to Keycloak login...
  //       </div>
  //     </motion.div>
  //   );
  // }

  return (
    <ThemeProvider>
      <div>
        <Routes>
          <Route path="/*" element={<CertsRoutes />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
