import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { federation } from "@module-federation/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isVercel = !!process.env.VERCEL;

console.log("VITE BASE", process.env.VITE_BASE);
console.log("VITE REMOTE CERT URL", process.env.VITE_REMOTE_CERT_URL);

export default defineConfig({
  server: {
    // port: 5101,
    port: 5180,

    strictPort: true,
    proxy: {
      "/api": {
        target: "http://pre-prod.be.anchorvpn.net",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
    },
  },
  base: isVercel ? "/" : "/gosecure-certmanager/",
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "certmanager-ui-remote",
      filename: "remoteEntry.js",
      remotes: {
        "gosecure-shell": {
          type: "module",
          name: "gosecure-shell",
          entry: "http://localhost:5101/gosecure-shell/remoteEntry.js",
          // entry: "https://totesoft.github.io/gosecure-shell/",
          entryGlobalName: "gosecure-shell",
          shareScope: "default",
        },
      },
      exposes: {
        "./routes": "./src/routes/index.tsx",
        "./RootCert": "./src/pages/RootCert",
        "./IntermediateCert": "./src/pages/IntermediateCert",
        "./UserCert": "./src/pages/UserCert",
        "./testapi": "./src/pages/testapipage",
        "./Home": "./src/pages/Home",
        "./certdashboard": "./src/pages/CertmanagerDashboard",
      },
      shared: {
        react: { singleton: true } as any,
        "react-dom": { singleton: true } as any,
        "react-router-dom": { singleton: true } as any,
        "@react-keycloak/web": { singleton: true, eager: true } as any,
        "keycloak-js": { singleton: true, eager: true } as any,
      },
    }),
  ],
  esbuild: { target: "esnext" },
  optimizeDeps: { esbuildOptions: { target: "esnext" } },
  build: {
    target: "esnext",
    rollupOptions: { output: { format: "es" } },
    modulePreload: { polyfill: false },
  },
  resolve: {
    dedupe: ["react", "react-dom", "react-router-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
