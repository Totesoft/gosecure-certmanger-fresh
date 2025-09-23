import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import type { ZodTypeAny } from "zod";
import { ZodObject, ZodEnum, ZodEffects, ZodString, ZodNumber } from "zod";
import { IntermediateCASchema, type IntermediateCASchemaType } from "@/zod-schemas/IntermediateCASchema";
import { IntermediateCertFields } from "@/hooks/intermediatecert-fields";
import { Button, Label, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@totesoft/ui-kit";
import { Toaster } from "react-hot-toast";

// -----------------------------
// Helper functions
// -----------------------------
const extractShape = (schema: ZodTypeAny) => {
    if (schema instanceof ZodEffects) {
        const inner = schema._def.schema;
        if (inner instanceof ZodObject) {
            return inner.shape;
        }
        return {};
    }
    if (schema instanceof ZodObject) {
        return schema.shape;
    }
    return {};
};

const getFieldType = (
    schema: ZodTypeAny): "text" | "password" | "select" | "number" => {
    if (schema instanceof ZodEffects) return getFieldType(schema._def.schema);
    if (schema instanceof ZodEnum) return "select";
    if (schema instanceof ZodNumber) return "number";
    if (schema instanceof ZodString) return "text";
    return "text";
};

const extractLabel = (id: string) =>
    IntermediateCertFields.find((field) => field.id === id)?.label || id;

// -----------------------------
// Form Component
// -----------------------------
function IntermediateCertForm() {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<IntermediateCASchemaType>({
        resolver: zodResolver(IntermediateCASchema),
    });

    const shape = extractShape(IntermediateCASchema);
    const keyLength = watch("keyLength");

    useEffect(() => {
        if (keyLength) {
            setValue("passphrase", "");
            setValue("confirmPassphrase", "");
        }
    }, [keyLength, setValue]);

    const importantFields = [
        "common_name",
        "organization",
        "country",
        "keyLength",
        "validity_days",
        "passphrase",
        "confirmPassphrase",
        "parentCA",
    ];

    const onSubmit = (data: IntermediateCASchemaType) => {
        console.log("Intermediate CA Data:", data);
    };

    return (
       <div className="flex p-4 items-center justify-center">
            <div className="w-full max-w-xl mx-auto  rounded-xl shadow-lg relative overflow-hidden">
            <h2 className="text-2xl font-bold p-3 text-[var(--sidebar-foreground)] hover:text-[var(--sidebar-accent-foreground)]">Create Intermediate CA Certificate</h2>
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
                        <div
                            key={key}
                            className="flex flex-col md:flex-row md:items-center gap-2 py-2 border-b border-gray-100 last:border-b-0"
                        >
                            {/* Label */}
                            <div className="md:w-1/4 text-md text-left font-medium flex items-center gap-3">
                            <Label
                                htmlFor={key}
                                
                            >
                                {extractLabel(key)}
                                {isImportant && <span className="text-red-500 text-lg">*</span>}
                            </Label>
                            </div>

                            {/* Field */}
                            <div className="flex-1">
                                <div className="space-y-4">
                                {fieldType === "select" ? (
                                    <Controller
                                        name={key as keyof IntermediateCASchemaType}
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value || ""}
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    if (key === "keyLength") {
                                                        setValue("passphrase", "");
                                                        setValue("confirmPassphrase", "");
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="w-full h-10 border rounded-md bg-background focus:outline-none text-foreground">
                                                    <SelectValue placeholder={`Select ${extractLabel(key)}`} />
                                                </SelectTrigger>

                                                <SelectContent className="w-full min-w-0 bg-popover text-popover-foreground rounded-md shadow-md">
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
                                        {...register(key as keyof IntermediateCASchemaType)}
                                        className="w-full h-10 border rounded-md focus:ring bg-background text-foreground px-3"
                                    />
                                )}

                                {errors[key as keyof IntermediateCASchemaType] && (
                                    <p className="text-sm text-red-400 mt-1">
                                        {errors[key as keyof IntermediateCASchemaType]?.message}
                                    </p>
                                )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Button Section */}
                <div className="flex justify-center pt-4">
                    <Button
                        variant="default"
                        type="submit"
                        className="bg-[var(--sidebar-accent)] hover:bg-blue-600 px-6 py-2 h-9 text-white w-full font-bold  shadow-lg transition-all transform hover:scale-105  active:scale-95"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Generate Intermediate CA

                    </Button>
                </div>
            </motion.form>
            </div>
        </div>
    );
}

export default IntermediateCertForm;
