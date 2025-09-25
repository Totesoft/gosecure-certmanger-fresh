import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import CertsRoutes from "./routes";
import { Loader } from "lucide-react";
import { motion } from "framer-motion";

export default function App() {
    const [keycloak, setKeycloak] = useState<any>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [initialized, setInitialized] = useState(false);

    import("gosecure-shell/Keycloak").then(console.log).catch(console.error);

    useEffect(() => {
        // Dynamically import Keycloak from host
        import("gosecure-shell/Keycloak")
            .then((module) => {
                const kc = module?.keycloak;
                if (!kc) throw new Error("Keycloak module is undefined!");
                setKeycloak(kc);

                // Initialize Keycloak
                kc.init({ onLoad: "check-sso" }).then((auth: boolean) => {
                    setAuthenticated(auth);
                    setInitialized(true);

                    // Redirect to Shell login if not authenticated
                    if (!auth) {
                        kc.login();
                    }
                });

                // Listen for login/logout events
                kc.onAuthSuccess = () => setAuthenticated(true);
                kc.onAuthLogout = () => setAuthenticated(false);
                kc.onTokenExpired = () =>
                    kc.updateToken(30).catch(() => setAuthenticated(false));
            })
            .catch((err) => {
                console.error("Failed to load Keycloak from host", err);
                setInitialized(true);
            });
    }, []);

    if (!initialized) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-200 to-white p-4"
            >
                <div className="flex items-center gap-3 text-black text-lg font-medium">
                    <Loader className="size-10 animate-spin" /> Loading...please wait.
                </div>
            </motion.div>
        );
    }

    return (
        <Routes>
            {authenticated ? (
                <Route path="/*" element={<CertsRoutes />} />
            ) : (
                <Route path="*" element={<div>Redirecting to Shell login...</div>} />
            )}
        </Routes>
    );
}