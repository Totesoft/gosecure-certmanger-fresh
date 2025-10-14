// import { User } from "@/types/auth";
import { toast } from "react-hot-toast";
import { ToastMessage } from "@/types/toast";

export function LoginSuccessMessage(user: User): ToastMessage {
      return {
            title: "Login Successful",
            description: `Welcome back, ${user?.first_name || "user"}!`,
            className: "bg-green-500 text-white"
      }
}
export function LogoutSuccessMessage(): ToastMessage {
      return {
            title: "Logout Successful",
            description: "You have been logged out successfully.",
            className: "bg-green-500 text-white"
            // path: "/login"
      }
}


export function RegisterSuccessMessage(user: User): ToastMessage {
      return {
            title: "Registration Successful",
            description: `Welcome, ${user?.first_name || "user"}! Please verify your email before logging in.`,
            className: "bg-green-500 text-white",
            path: "/login"
      };
}

export function RegisterFailureMessage(error: any): ToastMessage {
      return {
            title: "Registration Failed",
            description: error?.message || "Something went wrong. Please try again.",
            className: "bg-green-500 text-white",
            path: ""
      }
}
export function LoginFailureMessage(error: any): ToastMessage {
      return {
            title: "Login Failed",
            description: error?.message || "Something went wrong. Please try again.",
            className: "bg-green-500 text-white",
            path: "/login"
      }
}
// Root CA 
export function CertificateSuccessMessage(type: string): ToastMessage {
      return {
            title: "Certificate Generated",
            description: `Your ${type} certificate has been generated successfully.`,
            className: "bg-green-500 text-white"
      }
}

export function CertificateFailureMessage(error: any): ToastMessage {
      return {
            title: "Certificate Generated",
            description: error?.message || "Something went wrong. Please try again.",
            className: "bg-red-500 text-white"
      }
}


export const DownloadSuccessMessage = (name?: string) =>
      toast.success(`Download started ${name ? `for ${name}` : ""}`);

export const DownloadFailureMessage = () =>
      toast.error("Failed to download certificate");

export const NetworkErrorMessage = () =>
      toast.error("Network error. Please try again");

export const MonitoringFailureMessage = (_p0: string) =>
      toast.error("Network error. Please try again");

export const AdminFailureLogs = (_p0: string) =>
      toast.error("");

