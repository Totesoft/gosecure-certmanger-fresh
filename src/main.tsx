import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import CertsRoutes from "./routes";
import "./index.css";
import "@totesoft/ui-kit";
import App from "./App";





ReactDOM.createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <App />
  </HashRouter>
);

