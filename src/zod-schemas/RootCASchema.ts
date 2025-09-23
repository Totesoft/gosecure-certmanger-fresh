import { z } from "zod"

const allowedKeyLengths = ["2048", "4096", "8192"] as const;
export const RootCASchema = z

    .object({
        common_name: z.string().min(3, "Common Name is required"),
        country: z.string().length(2, "Use 2-letter country code"),
        validity_years: z.string().min(1, "Validity is required")
            .transform((val) => parseInt(val, 10))
            .refine((val) => !isNaN(val) && val >= 1 && val <= 30, {
                message: "Validity must be between 1 and 30 years",
            }),
        cert_type: z.string().min(4, {
            message: "Cert Type must be at least 4 characters.",
        }),

        state: z.string().min(2, {
            message: "State must be at least 2 characters.",
        }),
        locality: z.string().min(2, {
            message: "Locality must be at least 2 characters.",
        }),
        key_length: z.enum(allowedKeyLengths, {
            errorMap: () => ({ message: `Key length must be one of: ${allowedKeyLengths.join(", ")}` }),
        }),
        passphrase: z
            .string()
            .min(8, { message: "Passphrase is too short" })
            .max(20, { message: "Passphrase is too long" })
            .regex(/^(?=.[A-Z])(?=.\d)(?=.[!@#$%^&])/, {
                message: "Must include uppercase, number, and special character",
            }),
        confirmPassphrase: z.string(),
    })
    .refine((data) => data.passphrase === data.confirmPassphrase, {
        path: ["confirmPassphrase"],
        message: "Passphrases do not match",
    })

export type RootCASchemaType = z.infer<typeof RootCASchema>