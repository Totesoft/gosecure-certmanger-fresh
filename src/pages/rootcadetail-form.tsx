import { useState } from "react"
import { Button } from "@totesoft/ui-kit"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@totesoft/ui-kit"
import { Card, CardContent, CardHeader, CardTitle } from "@totesoft/ui-kit"
import { Copy, Download } from "lucide-react"

type RootCADetailProps = {
  cert: {
    subject_cn: string
    subject_o?: string
    subject_ou?: string
    issuer_cn: string
    issuer_o?: string
    issuer_ou?: string
    not_before: string
    not_after: string
    sha256_fingerprint: string  
    public_key_sha256: string
    pem_cert: string
  }
}

export default function RootCADetail({ cert }: RootCADetailProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([cert.pem_cert], { type: "application/x-pem-file" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${cert.subject_cn || "certificate"}.pem`
    a.click()
    window.URL.revokeObjectURL(url)
  }



  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
      <div className="font-bold">{label}</div>
      <div className="col-span-2">{value}</div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <h1 className="text-3xl font-bold">
          Certificate Viewer
        </h1>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" /> Download PEM
          </Button>
          <Button variant="destructive">Revoke</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md mx-auto m-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="validity">Validity</TabsTrigger>
          <TabsTrigger value="pem">PEM</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Issued To</CardTitle>
            </CardHeader>
            <CardContent className="divide-y text-md">
              <Field label="Common Name (CN)" value={cert.subject_cn} />
              <Field label="Organization (O)" value={cert.subject_o || "Not Part Of Certificate"} />
              <Field label="Organizational Unit (OU)" value={cert.subject_ou || "Not Part Of Certificate"} />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Issued By</CardTitle>
            </CardHeader>
            <CardContent className="divide-y text-md">
              <Field label="Common Name (CN)" value={cert.issuer_cn} />
              <Field label="Organization (O)" value={cert.issuer_o || "Not Part Of Certificate"} />
              <Field label="Organizational Unit (OU)" value={cert.issuer_ou || "Not Part Of Certificate"} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validity Tab */}
        <TabsContent value="validity" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Validity</CardTitle>
            </CardHeader>
            <CardContent className="divide-y text-md">
              <Field label="Issued On" value={cert.not_before} />
              <Field label="Expires On" value={cert.not_after} />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>SHA-256 Fingerprints</CardTitle>
            </CardHeader>
            <CardContent className="divide-y text-md">
              <div className="flex items-center justify-between py-2">
                <span className="font-medium">Certificate</span>
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-xs">{cert.sha256_fingerprint}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopy(cert.sha256_fingerprint, "Certificate Fingerprint")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-medium">Public Key</span>
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-xs">{cert.public_key_sha256}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopy(cert.public_key_sha256, "Public Key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-2">{copied} copied</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PEM Tab */}
        <TabsContent value="pem" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>PEM Encoded Certificate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(cert.pem_cert, "PEM Certificate")}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copy PEM
                </Button>
              </div>
              <pre className="overflow-auto max-h-[500px] text-md  p-4 rounded-lg border">
                {cert.pem_cert}
              </pre>
              {copied === "PEM Certificate" && (
                <p className="text-md text-green-600 mt-2">PEM copied</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
