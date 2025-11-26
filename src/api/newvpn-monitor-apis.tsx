import axios from "axios";
import { MonitoringFailureMessage } from "@/urls/toasts"; // optional custom toast
//import Toast from "@totesoft/ui-kit"
// Base API URL
//const API_BASE = "/api/monitoring";
const API_BASE = "https://pre-prod.be.anchorvpn.net/api/v1/monitoring";

export const getMonitoringHealth = async () => {
    try {
        const res = await axios.get(`${API_BASE}/health`);
        return { success: true, data: res.data };
    } catch {
        MonitoringFailureMessage("Failed to load monitoring health");
        return { success: false, data: [] };
    }
};


/** ✅ Get Monitoring Status */
export const getMonitoringStatus = async () => {
    try {
        const res = await axios.get(`${API_BASE}/status`);
        return { success: true, data: res.data };
    } catch {
        MonitoringFailureMessage("Failed to load monitoring status");
        return { success: false, data: [] };
    }

};

/** ✅ Get Monitoring Metrics */
export const getMonitoringMetrics = async () => {
    try {
        const res = await axios.get(`${API_BASE}/metrics`);
        return { success: true, data: res.data };
    } catch {
        MonitoringFailureMessage("Failed to load monitoring metrics");
        return { success: false, data: [] };
    }
};

/** ✅ Get Monitoring Alerts */
export const getMonitoringAlerts = async () => {
    try {
        const res = await axios.get(`${API_BASE}/alerts/`);
        // Ensure the data is always an array
        const alerts = Array.isArray(res.data) ? res.data : res.data?.results || [];
        return { success: true, data: alerts };
    } catch (error) {
        MonitoringFailureMessage("Failed to load monitoring alerts");
        return { success: false, data: [] };
    }
};

/** ✅ List Monitored Services */
export const getMonitoredServices = async () => {
    try {
        const res = await axios.get(`${API_BASE}/services`);
        return { success: true, data: res.data };
    } catch {
        MonitoringFailureMessage("Failed to load monitored services");
        return { success: false, data: [] };
    }
};

// /** ✅ Get Specific Service Status */
// export const getServiceStatus = async (service_name: string) => {
//   try {
//     const res = await axios.get(`${API_BASE}/services/${service_name}`);
//     return { success: true, data: res.data };
//   } catch {
//     MonitoringFailureMessage(`Failed to load status for service: ${service_name}`);
//     return { success: false, data: [] };
//   }
// };


/** ✅ Get OpenVPN Service */
export const getOpenVPNService = async () => {
    try {
        const res = await axios.get(`${API_BASE}/services/openvpn`);
        //  console.log('response;', res)

        return { success: true, data: res.data };
    } catch {
        MonitoringFailureMessage("Failed to load OpenVPN service");
        return { success: false, data: [] };
    }
};

/** ✅ Get WireGuard Service */
export const getWireGuardService = async () => {
    try {
        const res = await axios.get(`${API_BASE}/services/wireguard`);
        return { success: true, data: res.data };
    } catch {
        MonitoringFailureMessage("Failed to load WireGuard service");
        return { success: false, data: [] };
    }
};

/** ✅ Get StrongSwan Service */
export const getStrongSwanService = async () => {
    try {
        const res = await axios.get(`${API_BASE}/services/strongswan`);
        return { success: true, data: res.data };
    } catch {
        MonitoringFailureMessage("Failed to load StrongSwan service");
        return { success: false, data: [] };
    }
};