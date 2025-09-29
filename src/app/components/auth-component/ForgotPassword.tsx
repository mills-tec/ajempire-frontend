"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import z from "zod";
import Link from "next/link";
import { CloseIcon } from "@/components/svgs/CloseIcon";

interface ForgotPasswordProps {
    onClose: () => void;
    setScreen: (screen: "intro" | "signin" | "signup" | "phonenumber" | "forgotpassword") => void;
}

export default function ForgotPassword({ onClose, setScreen }: ForgotPasswordProps) {
    const [form, setForm] = useState({ email: "" });
    const [errors, setErrors] = useState<{
        email?: string;
    }>({});
    const router = useRouter();

    // Schema: password must be at least 6 chars, confirm_password must match password
    const schema = z.object({
        email: z.string().email({ message: "Invalid email address" }),
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const result = schema.safeParse(form);
        if (!result.success) {
            const fieldErrors: { email?: string } = {};
            result.error.issues.forEach((err) => {
                const field = err.path[0] as "email";
                if (field === "email") {
                    (fieldErrors as any)[field] = err.message;
                }
            });
            setErrors(fieldErrors as any);
            return;
        }
        setErrors({});

        router.push("/auth/password-reset-verification");
    }

    return (
        <section className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-3xl flex flex-col justify-between w-full h-full lg:h-[30rem] lg:w-[27rem]">
                <div className="flex  items-center  justify-center border-b px-4 border-b-black/10 pt-8 pb-3">

                    <h1 className="text-center">Forgot Password</h1>

                </div>
                <div className="flex-1 pt-[6rem] space-y-5 py-8">
                    <div className="w-[80%] mx-auto space-y-2">
                        <p className="text-xs text-[#838383]">
                            Enter your email address below, and we’ll send you a 6-digit
                            password reset code.
                        </p>
                    </div>
                    <form className="w-[80%] mx-auto space-y-8" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label className="text-sm" htmlFor="email">
                                Email<span className="text-red-600">*</span>{" "}
                            </Label>
                            <Input
                                name="email"
                                type="email"
                                placeholder="Please enter your email address"
                                value={form.email}
                                onChange={handleChange}
                                className="text-base"
                            />
                            {errors.email && (
                                <div className="text-xs text-red-600 mt-1">{errors.email}</div>
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
                </div>
                <div className="absolute top-4 right-4 cursor-pointer">
                    <CloseIcon className="w-6 text-black opacity-80" onClick={onClose} />
                </div>
            </div>
        </section>
    );
}
