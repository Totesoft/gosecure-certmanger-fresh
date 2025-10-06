import { Button } from "@totesoft/ui-kit";
import { Link } from "react-router-dom"; // Use router's Link instead

export default function Dashboard() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
            <div className="bg-white shadow-xl rounded-2xl p-10 max-w-xl w-full text-center border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">CertManager Dashboard</h2>
                <p className="text-gray-600 mb-1">
                    Manage your certificates, monitor expiry, and perform PKI operations.
                </p>
                <p className="text-gray-500 mb-8">
                    Use the links below to navigate to specific sections.
                </p>

                <div className="flex flex-col gap-3 items-center">
                    <Link to="/">
                        <Button variant="destructive" size="lg" className="w-48 shadow-md hover:shadow-lg transition">
                            Get Started
                        </Button>
                    </Link>

                    <Link to="/ovpn">
                        <Button variant="destructive" size="lg" className="w-48 shadow-md hover:shadow-lg transition">
                            OVPN
                        </Button>
                    </Link>

                    <Link to="/root">
                        <Button variant="destructive" size="lg" className="w-48 shadow-md hover:shadow-lg transition">
                            Root CA List
                        </Button>
                    </Link>

                    <Link to="/root">
                        <Button variant="destructive" size="lg" className="w-48 shadow-md hover:shadow-lg transition">
                            Intermediate CA List
                        </Button>
                    </Link>
                    <Link to="/root">
                        <Button variant="destructive" size="lg" className="w-48 shadow-md hover:shadow-lg transition">
                            Expiry Alerts
                        </Button>
                    </Link>
                </div>

                <div className="mt-10 text-sm text-gray-400">
                    CertManager
                </div>
            </div>
        </div>
    );
}
