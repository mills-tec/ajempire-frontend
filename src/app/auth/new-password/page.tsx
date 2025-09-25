"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Eye, EyeClosed, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import z from "zod";

export default function NewPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ password: "", confirm_password: "" });
  const [errors, setErrors] = useState<{
    password?: string;
    confirm_password?: string;
  }>({});
  const router = useRouter();

  // Schema: password must be at least 6 chars, confirm_password must match password
  const schema = z
    .object({
      password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
      confirm_password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords do not match",
      path: ["confirm_password"],
    });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: { password?: string; confirm_password?: string } = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as "password" | "confirm_password";
        if (field === "password" || field === "confirm_password") {
          (fieldErrors as any)[field] = err.message;
        }
      });
      setErrors(fieldErrors as any);
      return;
    }
    setErrors({});
    // Handle successful form submission here
    alert("Form submitted successfully!");
    router.push("/auth/password-reset-complete");
  }

  return (
    <section className="bg-brand_gray/20 h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="bg-white rounded-3xl flex flex-col justify-between min-h-[30rem] w-[27rem]">
        <div className="flex justify-between items-center border-b px-4 border-b-black/10 pt-8 pb-3">
          <div></div>
          <h1>Create a new password</h1>
          <Link href={"password-reset-verification"}>
            <X className="h-4 cursor-pointer" />
          </Link>
        </div>
        <div className="flex-1 space-y-8 py-8">
          <div className="w-[80%] mx-auto space-y-2">
            <p className="text-xs text-[#838383]">
              Enter a new password you would like to associate with your account
              below.
            </p>
          </div>
          <form className="w-[80%] mx-auto space-y-14" onSubmit={handleSubmit}>
            <div className="space-y-8">
              <div className="relative space-y-2">
                <Label htmlFor="password" className="text-sm">
                  New password<span className="text-red-600">*</span>{" "}
                </Label>
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={form.password}
                  onChange={handleChange}
                  className="pr-10 text-base"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-[45px] transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="h-4" />
                  ) : (
                    <EyeClosed className="h-4" />
                  )}
                </button>
                {errors.password && (
                  <div className="text-xs text-red-600 mt-1">
                    {errors.password}
                  </div>
                )}
              </div>
              <div className="relative space-y-2">
                <Label htmlFor="confirm_password" className="text-sm">
                  Confirm new password<span className="text-red-600">*</span>{" "}
                </Label>
                <Input
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Reenter new password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  className="pr-10 text-base"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-[40px] transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <Eye className="h-4" />
                  ) : (
                    <EyeClosed className="h-4" />
                  )}
                </button>
                {errors.confirm_password && (
                  <div className="text-xs text-red-600 mt-1">
                    {errors.confirm_password}
                  </div>
                )}
              </div>
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
      </div>
    </section>
  );
}
