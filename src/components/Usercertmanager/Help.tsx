// --- HELP TAB ---
export const renderHelp = () => (
    <div className="p-10 max-w-3xl mx-auto text-lg leading-relaxed">
        <h2 className="text-3xl font-bold mb-4">Help</h2>
        <p className="mb-4">Use this dashboard to manage VPN certificates:</p>
        <ul className="list-disc pl-8 space-y-2">
            <li><b>My Certificates:</b> View and expand certificate hierarchies.</li>
            <li><b>Alerts:</b> Shows certificates expiring soon.</li>
            <li><b>Download:</b> Retrieve a certificate by its ID.</li>
            <li><b>Server Details:</b> View VPN server configuration linked to your Org ID.</li>
        </ul>
    </div>
);
