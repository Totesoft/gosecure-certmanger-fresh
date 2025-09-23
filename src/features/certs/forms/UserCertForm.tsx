import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ZodTypeAny, ZodObject, ZodEnum, ZodEffects, ZodString, ZodNumber } from "zod";
import { UserCertSchema, type UserCertSchemaType } from "@/zod-schemas/UserCertSchema";
import { UserCertFields } from "@/hooks/usercert-fields";
import { Button, Label, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@totesoft/ui-kit";
import { Toaster } from "react-hot-toast";

// -----------------------------
// Helper functions
// -----------------------------
const extractShape = (schema: ZodTypeAny) => {
    if (schema instanceof ZodEffects) {
        const inner = schema._def.schema;
        if (inner instanceof ZodObject) return inner.shape;
        return {};
    }
    if (schema instanceof ZodObject) return schema.shape;
    return {};
};

const getFieldType = (schema: ZodTypeAny): "text" | "password" | "select" | "number" => {
    if (schema instanceof ZodEffects) return getFieldType(schema._def.schema);
    if (schema instanceof ZodEnum) return "select";
    if (schema instanceof ZodNumber) return "number";
    if (schema instanceof ZodString) return "text";
    return "text";
};

const extractLabel = (id: string) =>
    UserCertFields.find((field) => field.id === id)?.label || id;

// -----------------------------
// Form Component
// -----------------------------
function UserCertForm() {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<UserCertSchemaType>({
        resolver: zodResolver(UserCertSchema),
    });

    const shape = extractShape(UserCertSchema);
    const keyLength = watch("keyLength");

    useEffect(() => {
        if (keyLength) {
            setValue("passphrase", "");
            setValue("confirmPassphrase", "");
        }
    }, [keyLength, setValue]);

    const importantFields = UserCertFields.map(f => f.id);

    const onSubmit = (data: UserCertSchemaType) => {
        console.log("User Certificate Data:", data);
        // TODO: call backend to generate certificate
    };

    return (
        <div className="relative w-full flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <h2 className="text-2xl font-bold p-3 text-gray-900 dark:text-gray-100">Create User Certificate</h2>
            <Toaster position="top-right" reverseOrder={false} />

            <motion.form
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6 max-w-3xl p-8 rounded-xl w-full bg-background shadow-lg border border-border"
            >
                {Object.entries(shape).map(([key, schema]) => {
                    const fieldType = getFieldType(schema);
                    const isPassword = key.toLowerCase().includes("passphrase");
                    const isNumber = key.toLowerCase().includes("validity");
                    const inputType = isPassword ? "password" : isNumber ? "number" : "text";
                    const isImportant = importantFields.includes(key);

                    return (
                        <div key={key} className="flex flex-col md:flex-row md:items-center gap-2 py-2 border-b border-gray-100 last:border-b-0">
                            {/* Label */}
                            <Label
                                htmlFor={key}
                                className="md:w-1/4 text-md text-left font-medium flex items-center gap-2"
                            >
                                {extractLabel(key)}
                                {isImportant && <span className="text-red-500 text-lg">*</span>}
                            </Label>

                            {/* Field */}
                            <div className="flex-1">
                                {fieldType === "select" ? (
                                    <Controller
                                        name={key as keyof UserCertSchemaType}
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value?.toString() || ""}
                                                onValueChange={(val) =>
                                                    field.onChange(isNumber ? Number(val) : val)
                                                }
                                            >
                                                <SelectTrigger className="w-full h-10 border rounded-md bg-background dark:bg-background-dark text-foreground focus:outline-none">
                                                    <SelectValue placeholder={`Select ${extractLabel(key)}`} />
                                                </SelectTrigger>
                                                <SelectContent className="w-full min-w-0 bg-popover dark:bg-popover-dark text-popover-foreground dark:text-popover-foreground-dark rounded-md shadow-md">
                                                    {(schema as ZodEnum<[string, ...string[]]>).options.map(
                                                        (value) => (
                                                            <SelectItem
                                                                key={value}
                                                                value={value}
                                                                className="cursor-pointer px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                                                            >
                                                                {value}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                ) : (
                                    <Input
                                        id={key}
                                        type={inputType}
                                        {...register(key as keyof UserCertSchemaType, isNumber ? { valueAsNumber: true } : undefined)}
                                        className="w-full h-10 border rounded-md focus:ring bg-background dark:bg-background-dark text-foreground dark:text-foreground px-3"
                                    />
                                )}

                                {errors[key as keyof UserCertSchemaType] && (
                                    <p className="text-sm text-red-400 mt-1">
                                        {errors[key as keyof UserCertSchemaType]?.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Button Section */}
                <div className="flex justify-center pt-4">
                    <Button
                        type="submit"
                        className="bg-blue-400 text-white font-bold py-3 px-12 rounded-full shadow-lg transition-all transform hover:scale-105 hover:bg-blue-500 active:scale-95"
                    >
                        Generate User Certificate
                    </Button>
                </div>
            </motion.form>
        </div>
    );
}

export default UserCertForm;
