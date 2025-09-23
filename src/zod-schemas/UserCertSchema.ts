import { z } from "zod";

export const UserCertSchema = z.object({
    common_name: z.string().min(1, "Common Name is required"),
    organization: z.string().min(1, "Organization is required"),
    country: z.string().length(2, "Country must be 2 letters"),
    keyLength: z.enum(["2048", "4096"], { message: "Select a valid key length" }),
    validity_days: z.number().min(1, "Validity must be at least 1 day"),
    passphrase: z.string().min(6, "Passphrase must be at least 6 characters"),
    confirmPassphrase: z.string().min(6, "Confirm your passphrase"),
}).refine((data) => data.passphrase === data.confirmPassphrase, {
    message: "Passphrases must match",
    path: ["confirmPassphrase"],
});

export type UserCertSchemaType = z.infer<typeof UserCertSchema>;