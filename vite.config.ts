import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { federation } from "@module-federation/vite";
import tailwindcss from "@tailwindcss/vite"
import path from "path";

const isVercel = !!process.env.VERCEL;


console.log("VITE BASE", process.env.VITE_BASE)
console.log("VITE REMOTE CERT URL", process.env.VITE_REMOTE_CERT_URL);

export default defineConfig({
  server: {
    // port: 5101,
    // cors: true,
    headers: { "Access-Control-Allow-Origin": "*" }, // helps Safari
    //origin: "http://localhost", // good practice for dev
  },
  base: isVercel ? '/' : '/gosecure-certmanager/',
  plugins: [
    react(),tailwindcss(),
    federation({
      name: "certmanager-ui-remote",
      filename: "remoteEntry.js",
      exposes: {
        "./routes": "./src/routes/index.tsx", // <- make sure this path exists
<<<<<<< Updated upstream
=======
        "./RootCert": "./src/pages/RootCert",
        "./IntermediateCert": "./src/pages/IntermediateCert",
        "./UserCert": "./src/pages/UserCert",
        "./RootCADetail": "./src/pages/CertViewer-form",
        "./testapi": "./src/pages/testapipage",
        "./Home": "./src/pages/Home",

      },
      shared: {
        react: { singleton: true } as any,
        "react-dom": { singleton: true } as any,
        "react-router-dom": { singleton: true } as any,
        "@react-keycloak/web": { singleton: true, eager: true } as any,
        "keycloak-js": { singleton: true, eager: true } as any,
        "axios": { singleton: true } as any,
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      },
      shared: ["react", "react-dom", "react-router-dom"],
    }),
  ],
  esbuild: { target: "esnext" },
  optimizeDeps: { esbuildOptions: { target: "esnext" } },
  build: {
    target: "esnext",
    rollupOptions: { output: { format: "es" } }, // keep ESM
    modulePreload: { polyfill: false },
  },
  resolve: {
    dedupe: ["react", "react-dom", "react-router-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
