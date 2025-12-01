import { useState } from "react"
import axios from "axios"

const API_BASE_URL = "https://pre-prod.be.anchorvpn.net/api/v1"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import type { UserCertificate } from "@/types/UserCerttypes";
import { usercertsmockdata } from "@/pages/AdmnCertmanagerMockdata";

const getStatusStyles = (isActive: boolean, days: number) => {
    if (!isActive) return { text: "Inactive", className: "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200" };
    if (days <= 30) return { text: "Expiring Soon", className: "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200" };
    return { text: "Active", className: "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200" };
};


export function useUserCerts() {
    const [usercerts, setUsercerts] = useState<UserCertificate[]>([])
    const [loadingUser, setLoadingUser] = useState(false)
    const [errorUser, setErrorUser] = useState("")

    const fetchUserCerts = async () => {
        setLoadingUser(true)
        setErrorUser("")

        try {
            const res = await axios.get(API_BASE_URL + "/certificates/user/")
            setUsercerts(res.data)
            // const userRes = usercertsmockdata;
            // setUsercerts(userRes);

        } catch (err) {
            setErrorUser("Failed to fetch user certificates")
        } finally {
            setLoadingUser(false)
        }
    }

    return { usercerts, loadingUser, errorUser, fetchUserCerts }


}

export function RenderUserCertsTable({ usercerts }: { usercerts: UserCertificate[] }) {
    const daysRemaining = (date: string | number | Date) => {
        const now = new Date();
        const target = new Date(date);
        return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="w-[80%] mx-auto border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
            <Table className="w-full">
                <TableHeader className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <TableRow>
                        <TableHead className="border-r dark:border-gray-700">Status</TableHead>
                        <TableHead className="border-r dark:border-gray-700">ID</TableHead>
                        <TableHead className="border-r dark:border-gray-700">Common Name</TableHead>
                        <TableHead className="dark:border-gray-700">Valid Until</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody className="text-lg">
                    {usercerts.map(cert => {
                        const days = daysRemaining(cert.valid_until);
                        const status = getStatusStyles(cert.is_active, days);

                        return (
                            <TableRow
                                key={cert.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                {/* STATUS */}
                                <TableCell className="border-r dark:border-gray-700">
                                    <span className={`px-3 py-1 rounded text-sm font-semibold ${status.className}`}>
                                        {status.text}
                                    </span>
                                </TableCell>

                                {/* ID */}
                                <TableCell className="border-r dark:border-gray-700 font-bold">
                                    {cert.id}
                                </TableCell>

                                {/* Common Name */}
                                <TableCell className="border-r dark:border-gray-700 font-bold text-blue-900 dark:text-blue-400">
                                    {cert.common_name}
                                </TableCell>

                                {/* Valid Until */}
                                <TableCell
                                    className={`font-semibold ${days <= 30
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-green-700 dark:text-green-300"
                                        }`}
                                >
                                    {new Date(cert.valid_until).toISOString().split("T")[0]}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
