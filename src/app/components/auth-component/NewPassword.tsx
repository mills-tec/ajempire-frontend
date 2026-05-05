"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { changePassword } from "@/lib/api";
import { Eye, EyeClosed, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import AuthBackButton from "./AuthBackButton";
import Spinner from "../Spinner";
import type { AuthStepProps } from "./auth-flow";

export default function NewPassword({
  onClose,
  onBack,
  canGoBack,
  setScreen,
}: AuthStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ password: "", confirm_password: "" });
  const [errors, setErrors] = useState<{
    password?: string;
    confirm_password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: { password?: string; confirm_password?: string } = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as "password" | "confirm_password";
        if (field === "password" || field === "confirm_password") {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      const email = localStorage.getItem("ajempire_signup_email");
      if (!email) return toast("Couldn't find your email. Please try again.");

      const res = await changePassword(email, form.password);
      if (res.error) return toast(res.error);

      toast("Password changed successfully!");
      setScreen("signin");
    } catch {
      toast("Couldn't change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {isLoading && <Spinner />}
      <div className="relative bg-white rounded-3xl flex flex-col size-full lg:h-[30rem] lg:w-[27rem]">
        {canGoBack && <AuthBackButton onBack={onBack} />}
        <div className="flex justify-between items-center border-b px-4 border-b-black/10 pt-8 pb-3">
          <div></div>
          <h1>Create a new password</h1>
          <button type="button" onClick={onClose}>
            <X className="h-4 cursor-pointer" />
          </button>
        </div>

        <div className="flex-1 flex flex-col py-8 justify-between h-full">
          <div className="space-y-8">
            <div className="w-[80%] mx-auto space-y-2">
              <p className="text-xs text-[#838383]">
                Enter a new password you would like to associate with your
                account below.
              </p>
            </div>

            <form
              className="w-[80%] mx-auto space-y-8"
              onSubmit={handleSubmit}
            >
              <div className="space-y-6">
                {/* New Password */}
                <div className="relative space-y-2">
                  <Label htmlFor="password" className="text-sm">
                    New password<span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="password"
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
                    className="absolute right-2 top-[45px] -translate-y-1/2 text-gray-500"
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
                    <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative space-y-2">
                  <Label htmlFor="confirm_password" className="text-sm">
                    Confirm new password<span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="confirm_password"
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
                    className="absolute right-2 top-[45px] -translate-y-1/2 text-gray-500"
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
                    <p className="text-xs text-red-600 mt-1">
                      {errors.confirm_password}
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full !rounded-full text-white hover:!text-white !bg-brand_gradient_light"
                type="submit"
                disabled={isLoading}
              >
                Submit
              </Button>
            </form>
          </div>

          <div className="text-xs mx-auto w-[80%] py-4">
            <p>Password requirements:</p>
            <p className="pl-1">1. At least 6 characters long</p>
            <p className="pl-1">2. Both passwords must match</p>
          </div>
        </div>
      </div>
    </section>
  );
}