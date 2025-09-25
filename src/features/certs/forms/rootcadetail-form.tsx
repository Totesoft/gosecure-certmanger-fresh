import { useState } from "react";
import forge from "node-forge";
import { Button } from "@totesoft/ui-kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@totesoft/ui-kit";
import { Card, CardContent, CardHeader, CardTitle } from "@totesoft/ui-kit";
import { Copy, Download, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

// Helper function to extract a field from attributes
function getField(attributes: any[], name: string) {
  const field = attributes.find((attr) => attr.shortName === name);
  return field ? field.value : "";
}

// Helper function to get an extension's value by name
function getExtension(extensions: any[], name: string) {
  const extension = extensions.find((ext) => ext.name === name);
  return extension ? extension.value : null;
}

// Helper function to format CRL Distribution Points
function formatCrlDistributionPoints(extension: any): string {
  if (!extension) return "Not Found";
  const urls = extension.uri;
  return urls ? urls.join(", ") : "Not Found";
}

// Helper function to format Subject Alternative Name
function formatSubjectAlternativeNames(extension: any): string {
  if (!extension) return "Not Found";
  const sans = extension.altNames;
  if (!sans || sans.length === 0) return "Not Found";
  return sans.map((san: any) => san.value).join(", ");
}

// Helper function to format Authority Information Access
function formatAuthorityInfoAccess(extension: any): string {
  if (!extension) return "Not Found";
  const accessDescriptions = extension.accessDescriptions;
  if (!accessDescriptions || accessDescriptions.length === 0) return "Not Found";
  return accessDescriptions
    .map((desc: any) => `${desc.accessMethod} (${desc.accessLocation.value})`)
    .join(", ");
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2">
      <span className="font-medium">{label}</span>
      <span className="text-gray-700 dark:text-gray-300 truncate max-w-[60%] text-right">{value}</span>
    </div>
  );
}

export default function RootCADetail() {
  const [cert, setCert] = useState<any>(null);
  const [pemCert, setPemCert] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchAndParsePem = async () => {
    try {
      setLoading(true);
      const response = await fetch("/gosecure-certmanager/vp.pem");
      if (!response.ok) throw new Error(`Failed to fetch PEM: ${response.status}`);

      let pemText = await response.text();
      pemText = pemText.replace(/^\uFEFF/, "").trim();

      const match = pemText.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/);
      if (!match) throw new Error("No valid certificate block found");

      const singleCertPem = match[0];
      const certObj = forge.pki.certificateFromPem(singleCertPem);

      const der = forge.asn1.toDer(forge.pki.certificateToAsn1(certObj)).getBytes();
      const md = forge.md.sha256.create();
      md.update(der);
      const sha256 = md.digest().toHex().match(/.{2}/g)?.join(":");

      const extensions = certObj.extensions;

      setCert({
        subject: certObj.subject.attributes,
        issuer: certObj.issuer.attributes,
        not_before: certObj.validity.notBefore.toUTCString(),
        not_after: certObj.validity.notAfter.toUTCString(),
        serial_number: certObj.serialNumber,
        sig_algo: forge.pki.oids[certObj.siginfo.algorithmOid],
        sha256_fingerprint: sha256,
        pem_cert: singleCertPem,
        policies: getExtension(extensions, "certificatePolicies"),
        crl_distribution_points: formatCrlDistributionPoints(
          getExtension(extensions, "cRLDistributionPoints")
        ),
        subject_alt_name: formatSubjectAlternativeNames(getExtension(extensions, "subjectAltName")),
        authority_info_access: formatAuthorityInfoAccess(
          getExtension(extensions, "authorityInfoAccess")
        ),
        basic_constraints: getExtension(extensions, "basicConstraints")?.ca ? "CA" : "End Entity",
        subject_key_id: getExtension(extensions, "subjectKeyIdentifier")?.subjectKeyIdentifier,
        authority_key_id: getExtension(extensions, "authorityKeyIdentifier")?.keyIdentifier,
        signed_certificate_timestamp_list: getExtension(
          extensions,
          "signedCertificateTimestampList"
        )?.value,
        signature_value: forge.util.bytesToHex(certObj.signature).match(/.{2}/g)?.join(":"),
      });

      setPemCert(singleCertPem);
    } catch (err: any) {
      console.error("Error parsing PEM:", err);
      toast.error(`Certificate Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([pemCert], { type: "application/x-pem-file" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "certificate.pem";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <h1 className="text-3xl font-bold">Certificate Viewer</h1>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button variant="outline" onClick={handleDownload} disabled={!pemCert}>
            <Download className="h-4 w-4 mr-2" /> Download PEM
          </Button>
          <Button variant="secondary" onClick={fetchAndParsePem} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : "Load Certificate"}
          </Button>
        </div>
      </div>

      {!cert ? (
        <p className="text-gray-500">Click "Load Certificate" to view details.</p>
      ) : (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md mx-auto m-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="validity">Validity</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Issued To</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                <Field label="Common Name (CN)" value={getField(cert.subject, "CN")} />
                <Field label="Organization (O)" value={getField(cert.subject, "O")} />
                <Field label="Organizational Unit (OU)" value={getField(cert.subject, "OU")} />
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Issued By</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                <Field label="Common Name (CN)" value={getField(cert.issuer, "CN")} />
                <Field label="Organization (O)" value={getField(cert.issuer, "O")} />
                <Field label="Organizational Unit (OU)" value={getField(cert.issuer, "OU")} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validity" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Validity Period</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                <Field label="Issued On" value={cert.not_before} />
                <Field label="Expires On" value={cert.not_after} />
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>SHA-256 Fingerprint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Fingerprint</span>
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-xs">{cert.sha256_fingerprint}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopy(cert.sha256_fingerprint, "Fingerprint")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Hierarchy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded p-3 bg-gray-50 dark:bg-gray-800">
                  <div className="font-medium">Root CA</div>
                  <div className="ml-4">Intermediate CA</div>
                  <div className="ml-8">{getField(cert.subject, "CN")}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Certificate Fields</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                <Field label="Serial Number" value={cert.serial_number} />
                <Field label="Signature Algorithm" value={cert.sig_algo} />
                <Field label="Signature Value" value={cert.signature_value} />
                <Field label="Basic Constraints" value={cert.basic_constraints} />
                <Field label="Subject Key ID" value={cert.subject_key_id} />
                <Field label="Authority Key ID" value={cert.authority_key_id} />
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Certificate Extensions</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                <Field label="Certificate Policies" value={cert.policies ? "Present" : "Not Found"} />
                <Field label="CRL Distribution Points" value={cert.crl_distribution_points} />
                <Field label="Signed Certificate Timestamp" value={cert.signed_certificate_timestamp_list ? "Present" : "Not Found"} />
                <Field label="Authority Information Access" value={cert.authority_info_access} />
                <Field label="Subject Alternative Name" value={cert.subject_alt_name} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}