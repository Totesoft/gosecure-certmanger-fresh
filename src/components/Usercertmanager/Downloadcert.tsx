import { useState } from "react";
import axios from "axios";
const API_BASE_URL = "https://pre-prod.be.anchorvpn.net/api/v1";

const DownloadCert = () => {
    const [certTypeToDownload, setCertTypeToDownload] = useState<string>("");
    const [certIdToDownload, setCertIdToDownload] = useState<string>("");
    const [downloading, setDownloading] = useState<boolean>(false);
    const [downloadMessage, setDownloadMessage] = useState<string>("");

    const handleDownload = async () => {
        if (!certIdToDownload.trim()) {
            setDownloadMessage("Please enter a certificate ID.");
            return;
        }

        setDownloading(true);
        setDownloadMessage("");

        try {
            const url = `${API_BASE_URL}/certificates/${certIdToDownload}/download/`;

            const res = await axios.get(url, {
                responseType: "blob"
            });

            const blob = new Blob([res.data], {
                type: "application/x-x509-ca-cert"
            });

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${certIdToDownload}.crt`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setDownloadMessage("Certificate downloaded successfully.");
        } catch (err) {
            console.error("Download failed", err);
            setDownloadMessage("Failed to download certificate. Check the ID.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="p-8 w-full max-w-xl mx-auto bg-surface rounded-xl shadow">
            <h2 className="text-3xl font-bold mb-6 text-text-primary">
                Download Certificate
            </h2>

            <label className="block text-lg font-medium mb-2 text-text-secondary">
                Select Certificate Type
            </label>

            <select
                value={certTypeToDownload}
                onChange={(e) => setCertTypeToDownload(e.target.value)}
                className="border border-border rounded-lg p-3 w-full mb-5 text-lg bg-background"
            >
                <option value="">-- Select Certificate Type --</option>
                <option value="root">Root CA</option>
                <option value="intermediate">Intermediate</option>
                <option value="issued">Issued Certificate</option>
            </select>

            <label className="block text-lg font-medium mb-2 text-text-secondary">
                Certificate ID
            </label>

            <input
                type="text"
                value={certIdToDownload}
                onChange={(e) => setCertIdToDownload(e.target.value)}
                placeholder="Enter Certificate ID"
                className="border border-border rounded-lg p-3 w-full mb-5 text-lg bg-background"
            />

            <button
                onClick={handleDownload}
                disabled={downloading}
                className={`px-6 py-3 w-full text-lg font-medium rounded-lg transition text-button-text ${downloading
                        ? "bg-button-disabled cursor-not-allowed"
                        : "bg-button-primary hover:bg-button-primary-hover"
                    }`}
            >
                {downloading ? "Downloading..." : "Download"}
            </button>

            {downloadMessage && (
                <p className="mt-5 text-lg font-semibold text-center text-text-secondary">
                    {downloadMessage}
                </p>
            )}
        </div>
    );
};

export default DownloadCert;
