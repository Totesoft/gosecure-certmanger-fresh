import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodTypeAny } from "zod";
import { ZodEffects, ZodObject, ZodEnum, ZodNumber, ZodString } from 'zod';
import { motion } from 'framer-motion';
import { RootCASchema, type RootCASchemaType } from "@/zod-schemas/RootCASchema";
import { CertFields } from "@/hooks/cert-fields";
import toast, { Toaster } from 'react-hot-toast';

import {
    Button,
    Label,
    Input,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@totesoft/ui-kit";



// Helper functions
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


const getFieldType = (schema: ZodTypeAny): "text" | "password" | "select" | "number" => {
    if (schema instanceof ZodEffects) return getFieldType(schema._def.schema);
    if (schema instanceof ZodEnum) return "select";
    if (schema instanceof ZodNumber) return "number";
    if (schema instanceof ZodString) return "text";
    return "text";
};


const extractLabel = (id: string) => CertFields.find((field) => field.id === id)?.label || id;


function RootCertForm() {
    const {
        register, control, handleSubmit, formState: { errors }, reset, watch, setValue
    } = useForm<RootCASchemaType>({
        resolver: zodResolver(RootCASchema),
    });


    const shape = extractShape(RootCASchema);
    // Call the actual hook to get API functions
    const keyLength = watch('keyLength');


    useEffect(() => {
        if (keyLength) {
            setValue('passphrase', '');
            setValue('confirmPassphrase', '');
        }
    }, [keyLength, setValue]);

    const importantFields = ['common_name', 'key_length', 'passphrase', 'confirmPassphrase'];
    const onSubmit = (data: RootCASchemaType) => {
        console.log("Root CA Data:", data);
    };

    return (
        <div className="flex  p-4 items-center justify-center">
            <div className="w-full max-w-xl mx-auto  rounded-xl shadow-lg relative overflow-hidden">
            <h2 className="text-2xl font-bold p-3 text-[var(--sidebar-foreground)] hover:text-[var(--sidebar-accent-foreground)]">Create Root CA Certificate</h2>
            <Toaster position="top-right" reverseOrder={false} />
            <motion.form
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                // className="space-y-6 max-w-3xl p-5 rounded-lg w-full"
                className="space-y-6 max-w-3xl p-8 rounded-xl w-full bg-background shadow-lg border border-border"
            >
                {Object.entries(shape).map(([key, schema]) => {
                    const fieldType = getFieldType(schema);
                    const isPassword = key.toLowerCase().includes("passphrase");
                    const isNumber = key.toLowerCase().includes("validity");
                    const inputType = isPassword ? "password" : isNumber ? "text" : "text";
                    const isImportant = importantFields.includes(key);


                    return (

                        // <div key={key} className="flex flex-col md:flex-row md:items-center gap-2 py-2 ">
                        <div key={key} className="flex flex-col md:flex-row md:items-center gap-2 py-2 border-b border-gray-100 last:border-b-0">
                            <Label
                                htmlFor={key}
                                className="md:w-1/4 text-md text-left font-medium flex items-center gap-2"
                            >
                                {extractLabel(key)}
                                {isImportant && <span className="text-red-500 text-lg">*</span>}
                            </Label>
                            <div className="flex-1">
                                {fieldType === "select" ? (
                                    <Controller
                                        name={key as keyof RootCASchemaType}
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
                                                    <SelectValue placeholder="Select Key Length" />
                                                </SelectTrigger>

                                                <SelectContent className="w-full min-w-0 bg-popover text-popover-foreground rounded-md shadow-md">
                                                    {(schema as ZodEnum<[string, ...string[]]>).options.map((value) => (
                                                        <SelectItem
                                                            key={value}
                                                            value={value}
                                                            className="cursor-pointer px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                                                        >
                                                            {value}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />

                                ) : (
                                    <Input
                                        id={key}
                                        type={inputType}
                                        {...register(key as keyof RootCASchemaType)}
                                        className="w-full h-10 border rounded-md focus:ring bg-background text-foreground px-3"
                                    />
                                )}
                                {errors[key as keyof RootCASchemaType] && (
                                    <p className="text-sm text-red-400 mt-1">
                                        {errors[key as keyof RootCASchemaType]?.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}


                {/* Button Section */}
                <div className="flex justify-center pt-4">

                    <Button variant='outline' size='lg'
                        //className="bg-background button-color-effects px-5">
                         className="bg-[var(--sidebar-accent)] hover:bg-blue-600 px-6 py-2 h-9 text-white w-full font-bold  shadow-lg transition-all transform hover:scale-105  active:scale-95">
                        Generate RootCA
                    </Button>

                </div>
            </motion.form>
            </div>
        </div>
    );
}



export default RootCertForm;