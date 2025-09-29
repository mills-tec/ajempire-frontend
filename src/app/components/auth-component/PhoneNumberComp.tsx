"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/assets/logo.png";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import React, { useState } from "react";
import z from "zod";
import { useRouter } from "next/navigation";
import { CloseIcon } from "@/components/svgs/CloseIcon";

interface PhoneNumberCompProps {
    onClose: () => void;
    setScreen: (screen: "intro" | "signin" | "signup" | "phonenumber" | "forgotpassword") => void;
}
export default function PhoneNumberComp({ onClose, setScreen }: PhoneNumberCompProps) {

    // Use phone and countryCode for phone number input
    const [form, setForm] = useState({ phone: "", countryCode: "+234" });
    const [errors, setErrors] = useState<{
        phone?: string;
    }>({});
    const router = useRouter();

    // Schema: phone must be at least 7 digits, countryCode must be present
    const schema = z.object({
        countryCode: z.string().min(1, { message: "Country code is required" }),
        phone: z
            .string()
            .min(7, { message: "Phone number must be at least 7 digits" })
            .regex(/^\d+$/, { message: "Phone number must be digits only" }),
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleCountryCodeChange(value: string) {
        setForm((prev) => ({ ...prev, countryCode: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const result = schema.safeParse(form);
        if (!result.success) {
            const fieldErrors: { phone?: string } = {};
            result.error.issues.forEach((err) => {
                const field = err.path[0] as "phone" | "countryCode";
                if (field === "phone" || field === "countryCode") {
                    fieldErrors[field === "phone" ? "phone" : "phone"] = err.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }
        setErrors({});
        // Handle successful form submission here
        alert("Form submitted successfully!");
        router.push("/auth/");
    }

    return (
        <section className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-3xl flex flex-col justify-between size-full lg:h-[30rem] lg:w-[27rem]">
                <Image
                    src={Logo}
                    alt=""
                    className="mx-auto py-8"
                    width={103}
                    height={48}
                />
                <div className="flex-1 pt-[3rem] space-y-5 py-8">
                    <form className="w-[80%] mx-auto space-y-8" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label className="text-sm" htmlFor="phone">
                                Phone Number<span className="text-red-600">*</span>{" "}
                            </Label>
                            <div className="flex border-2 rounded-md overflow-hidden">
                                <Select
                                    onValueChange={handleCountryCodeChange}
                                    value={form.countryCode}
                                >
                                    <SelectTrigger className="!w-[80px] border-none outline-none focus:ring-0 focus:outline-none">
                                        <SelectValue>
                                            {form.countryCode ? form.countryCode : "Code"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="+234">+234</SelectItem>
                                        <SelectItem value="+432">+432</SelectItem>
                                        <SelectItem value="+555">+555</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    name="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    placeholder="Enter your phone number"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="text-base outline-none ring-0 focus:outline-none focus:ring-0 focus:border-transparent flex-1 border-l-2 border-l-black/20 focus:border-l-black/20 rounded-none"
                                    style={{
                                        boxShadow: "none",
                                    }}
                                />
                            </div>
                            {errors.phone && (
                                <div className="text-xs text-red-600 mt-1">{errors.phone}</div>
                            )}
                        </div>

                        <div className="bg-white">
                            <Button
                                variant={"outline"}
                                className="w-full !rounded-full text-white hover:!text-white !bg-brand_gradient_light"
                                type="submit"
                            >
                                Submit
                            </Button>
                        </div>
                    </form>
                    <p className="text-xs mx-auto w-[80%] text-black/70 py-8 text-center">
                        By continuing you agree to out{" "}
                        <span className="text-[#006ACC] underline cursor-pointer">
                            Terms of use
                        </span>{" "}
                        and acknowledge that you have read our{" "}
                        <span className="text-[#006ACC] underline cursor-pointer">
                            Privacy Policy
                        </span>
                        . A verification code may be sent to this phone number via SMS,
                        WhatsApp or phone call. Message and data rates may apply.
                    </p>

                </div>
                <div className="absolute top-4 right-4 cursor-pointer">
                    <CloseIcon className="w-6 text-black opacity-80" onClick={onClose} />
                </div>
            </div>
        </section>
    );
}
