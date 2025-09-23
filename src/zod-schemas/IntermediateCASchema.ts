///////////////dummy/////////
import { z } from "zod";

export const IntermediateCASchema = z.object({
    common_name: z.string().min(1, "Common Name is required"),
    organization: z.string().min(1, "Organization is required"),
    country: z.string().length(2, "Country must be 2 letters"),
    keyLength: z.enum(["2048", "4096", "8192"], {
        required_error: "Key length is required",
    }),
    validity_days: z
        .string()
        .regex(/^\d+$/, "Must be a number")
        .transform(Number)
        .refine((val) => val > 0, "Validity must be greater than 0"),
    passphrase: z.string().min(6, "Passphrase must be at least 6 characters"),
    confirmPassphrase: z.string().min(6, "Confirm passphrase is required"),
    parentCA: z.string().min(1, "Parent CA is required"),
    // organizational_unit: z.string().optional(),
    // state: z.string().optional(),
    // locality: z.string().optional(),
    // email: z.string().email().optional(),
}).refine((data) => data.passphrase === data.confirmPassphrase, {
    message: "Passphrases do not match",
    path: ["confirmPassphrase"],
});

export type IntermediateCASchemaType = z.infer<typeof IntermediateCASchema>;
