import { Button } from "@totesoft/ui-kit";
import { Link } from "react-router-dom";

export default function CertmanagerDashboard() {
    return (
        <div className="min-h-screen flex bg-gray-200">
            {/* Sidebar */}
            <div className="w-64 bg-gray-300 p-6 flex flex-col gap-4">
                <h2 className="text-xl font-bold mb-4">UserCert Dashboard</h2>

                <Link to="/">
                    <Button variant="destructive" size="lg" className="w-full shadow-md hover:shadow-lg transition">
                        Get Started
                    </Button>
                </Link>

                {/* <Link to="/ovpn">
                    <Button variant="destructive" size="lg" className="w-full shadow-md hover:shadow-lg transition">
                        OVPN
                    </Button>
                </Link> */}

                <Link to="/rootCAlistAdmn">
                    <Button variant="destructive" size="lg" className="w-full shadow-md hover:shadow-lg transition">
                        Root CA List
                    </Button>
                </Link>

                <Link to="/intermediate">
                    <Button variant="destructive" size="lg" className="w-full shadow-md hover:shadow-lg transition">
                        Intermediate CA List
                    </Button>
                </Link>

                <Link to="/alerts">
                    <Button variant="destructive" size="lg" className="w-full shadow-md hover:shadow-lg transition">
                        Expiry Alerts
                    </Button>
                </Link>
            </div>

            {/* Main content */}
            <div className="flex-1 p-10">
                <div className="bg-white shadow-xl rounded-2xl p-10 border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to CertManager</h2>
                    <p className="text-gray-600 mb-2">
                        Manage your certificates, monitor expiry, and perform PKI operations.
                    </p>
                    <p className="text-gray-500">
                        Use the sidebar to navigate to specific sections.
                    </p>
                </div>
            </div>
        </div>
    );
}
