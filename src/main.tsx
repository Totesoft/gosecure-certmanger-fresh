import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import CertsRoutes from './routes'
import './index.css'
//import './styles/global.css'

import "@totesoft/ui-kit";

//document.documentElement.classList.add("light");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-4">CertManager Remote (Dev)</h1>
        {/* Mount at /certs for consistency */}
        <CertsRoutes />
      </div>
    </HashRouter>
  </React.StrictMode>
)