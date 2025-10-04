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
import { fogortPassword } from "@/lib/api";
import { toast } from "sonner";
import Spinner from "../Spinner";

interface ForgotPasswordProps {
  onClose: () => void;
  setScreen: (
    screen:
      | "intro"
      | "signin"
      | "signup"
      | "phonenumber"
      | "forgotpassword"
      | "verifypassresetcode"
  ) => void;
}

export default function ForgotPassword({
  onClose,
  setScreen,
}: ForgotPasswordProps) {
  const [form, setForm] = useState({ email: "" });
  const [errors, setErrors] = useState<{
    email?: string;
  }>({});
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Schema: password must be at least 6 chars, confirm_password must match password
  const schema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
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

    try {
      const { email } = form;
      const res = await fogortPassword(email);
      // Store JWT token in localStorage (accessible to JS, but not httpOnly)
      if (res?.message) {
        localStorage.setItem("ajempire_signup_email", email);
      }
      console.log("res: ", res);
      setErrors({});
      toast("Reset code sent successfully!");
      setIsLoading(false);
      setScreen("verifypassresetcode");
      // router.push("/dashboard");
    } catch (err) {
      toast("Password reset failed");
      setIsLoading(false);
    }
  }

  return (
    <section className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {isLoading && <Spinner />}
      <div className="relative bg-white rounded-3xl text-left flex flex-col justify-between w-full h-full lg:h-[30rem] lg:w-[27rem]">
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
                className="text-sm lg:text-base"
              />
              {errors.email && (
                <div className="text-xs text-red-600 mt-1">{errors.email}</div>
              )}
            </div>

            <div className="bg-white">
              <button
                className={`w-full !rounded-full text-base py-2 text-white hover:!text-white ${
                  isLoading || errors.email || form.email.trim().length == 0
                    ? "!bg-brand_gradient_light"
                    : "!bg-brand_pink"
                }`}
                type="submit"
                disabled={
                  isLoading || !!errors.email || form.email.trim().length === 0
                }
              >
                Submit
              </button>
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
