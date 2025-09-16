import React, { useState, useEffect } from 'react';
import { Button } from '@totesoft/ui-kit';
import { Label } from '@totesoft/ui-kit';
import { Input } from '@totesoft/ui-kit';

// --- PROPS FOR THE HELPER COMPONENT ---
// We define the types for our CustomFileInput component's props here.
interface CustomFileInputProps {
  label: string;
  acceptedFiles: string;
  fileState: string; // The state will be the file's content as a string
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
}

// --- HELPER COMPONENT FOR FILE INPUTS ---
const CustomFileInput: React.FC<CustomFileInputProps> = ({
  label,
  acceptedFiles,
  fileState,
  onFileSelect,
  onFileRemove
}) => {
  const isFileSelected = fileState.length > 0;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex items-center space-x-4">
        {isFileSelected ? (
          // --- VIEW WHEN FILE IS SELECTED ---
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center gap-2 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">File Selected</span>
            </div>
            <button
              type="button"
              onClick={onFileRemove}
              className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline focus:outline-none"
            >
              Remove
            </button>
          </div>
        ) : (
          // --- VIEW WHEN NO FILE IS SELECTED ---
          <>
            <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span>Choose File</span>
              <input
                type="file"
                className="sr-only"
                accept={acceptedFiles}
                onChange={onFileSelect}
              />
            </label>
            <span className="text-sm text-gray-500">No file selected</span>
          </>
        )}
      </div>
    </div>
  );
};


// --- MAIN OVPN GENERATOR COMPONENT ---
const OvpnGenerator: React.FC = () => {
  const [server, setServer] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [caCert, setCaCert] = useState("");
  const [userCert, setUserCert] = useState("");
  const [userKey, setUserKey] = useState("");
  const [tlsAuth, setTlsAuth] = useState("");
  const [preview, setPreview] = useState("");
  
  // --- STATE FOR NOTIFICATIONS (REPLACES ALERT) ---
  const [notification, setNotification] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  // --- EFFECT TO CLEAR NOTIFICATION ---
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000); // Notification disappears after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Reads the file content and stores it in state as a string
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        // We reset the input so the user can upload the same file again if they remove it
        event.target.value = ''; 
        setter(e.target?.result as string);
    };
    reader.onerror = () => {
        event.target.value = '';
        setNotification({message: 'Failed to read file.', type: 'error'});
    }
    reader.readAsText(file);
  };
 
  // Builds the final .ovpn configuration string
  const buildOVPN = () => {
    if (!caCert || !userCert || !userKey) {
      setNotification({message: 'Please upload CA, user cert, and user key!', type: 'error'});
      return "";
    }
 
return `client
dev tun
proto udp
remote ${server || 'your-server.com'} ${port || '1194'}
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
auth-user-pass
verb 3

<ca>
${caCert.trim()}
</ca>

<cert>
${userCert.trim()}
</cert>

<key>
${userKey.trim()}
</key>

${tlsAuth ? `<tls-auth>\n${tlsAuth.trim()}\n</tls-auth>` : ""}
    `.trim();
  }

  // --- HANDLER FUNCTIONS ---
  const handlePreview = () => {
    const content = buildOVPN();
    if (content) setPreview(content);
  };
   
  const handleDownload = () => {
    const content = buildOVPN();
    if (!content) {
        // The notification is already set inside buildOVPN if it fails
        return;
    }
    const blob = new Blob([content], { type: "application/x-openvpn-profile" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username || 'config'}.ovpn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-lg relative overflow-hidden">
       
        {/* --- NOTIFICATION COMPONENT --- */}
        {notification && (
            <div className={`p-4 text-white text-center text-sm ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                {notification.message}
            </div>
        )}

        {/* Header Section */}
        <div className="p-6 sm:p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Generate OpenVPN Profile</h2>
          <p className="mt-1 text-sm text-gray-600">
            Enter your server details and upload the required certificate files.
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* --- Server Details --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Connection Details</h3>
            
                <div>
                    <Label htmlFor="server" className="block text-sm font-medium text-gray-700">Server Address</Label>
                    <Input
                      id="server"
                      type="text"
                      value={server}
                      onChange={(e) => setServer(e.target.value)}
                      placeholder="vpn.example.com"
                      className="mt-1 block w-full border border-gray-300 text-black rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <Label htmlFor="port" className="block text-sm font-medium text-gray-700">Port</Label>
                    <Input
                      id="port"
                      type="text"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder="1194"
                      className="mt-1 block w-full border border-gray-300 text-black rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
             <div>
                <Label htmlFor="username" className="block text-sm font-medium text-gray-700">User Name (for filename)</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="my-vpn-profile"
                  className="mt-1 block w-full border border-gray-300 text-black rounded-md shadow-sm py-2 px-5 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
          </div>

          {/* --- File Uploads --- */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
             <h3 className="text-lg font-medium leading-6 text-gray-900">Certificates & Keys</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <CustomFileInput
                  label="CA Certificate (.crt)"
                  acceptedFiles=".crt,.pem,.txt"
                  fileState={caCert}
                  onFileSelect={(e) => handleFileUpload(e, setCaCert)}
                  onFileRemove={() => setCaCert("")}
                />
                <CustomFileInput
                  label="User Certificate (.crt)"
                  acceptedFiles=".crt,.pem,.txt"
                  fileState={userCert}
                  onFileSelect={(e) => handleFileUpload(e, setUserCert)}
                  onFileRemove={() => setUserCert("")}
                />
                <CustomFileInput
                  label="User Key (.key)"
                  acceptedFiles=".key,.txt"
                  fileState={userKey}
                  onFileSelect={(e) => handleFileUpload(e, setUserKey)}
                  onFileRemove={() => setUserKey("")}
                />
                <CustomFileInput
                  label="TLS Auth Key (optional)"
                  acceptedFiles=".key,.txt"
                  fileState={tlsAuth}
                  onFileSelect={(e) => handleFileUpload(e, setTlsAuth)}
                  onFileRemove={() => setTlsAuth("")}
                />
             </div>
          </div>
        </div>

        {/* Actions & Preview Section */}
        <div className="px-6 sm:px-8 pb-6 bg-gray-50 border-t border-gray-200 pt-6">
            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <Button variant={'outline'} className="bg-indigo-600 text-white hover:bg-indigo-700 px-2"
                onClick={handleDownload}>
                
                Download .ovpn
              </Button>
              <Button
                onClick={handlePreview} className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-2'
                variant={"default"}
              >
                Preview
              </Button>
            </div>

            {preview && (
              <div className="mt-6">
                <h3 className="font-bold mb-2 text-gray-800">Preview .ovpn</h3>
                <textarea
                  readOnly
                  className="w-full h-96 p-4 font-mono text-sm text-gray-200 bg-gray-900 rounded-lg border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
                  value={preview}
                />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default OvpnGenerator;

