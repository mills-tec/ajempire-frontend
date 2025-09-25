"use client";
import Image from "next/image";
import Logo from "@/assets/logo.png";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeClosed } from "lucide-react";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0])
          fieldErrors[err.path[0] as "email" | "password"] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    // Handle successful form submission here
    alert("Form submitted successfully!");
  }

  return (
    <section className="bg-brand_gray/20 h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="bg-white rounded-3xl flex flex-col justify-between min-h-[30rem] w-[27rem]">
        <Image
          src={Logo}
          alt=""
          className="mx-auto py-8"
          width={103}
          height={48}
        />
        <form className="w-[80%] mx-auto space-y-8" onSubmit={handleSubmit}>
          <div className="">
            <h1 className="">Create your account</h1>
            <p className="text-xs">
              Registration is easy, just fill the password.
            </p>
          </div>
          <div className="space-y-2">
            <div>
              <Label htmlFor="email">
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
            <div className="relative">
              <Label htmlFor="password">
                Password<span className="text-red-600">*</span>{" "}
              </Label>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Input your password"
                value={form.password}
                onChange={handleChange}
                className="pr-10 text-base"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-[42px] transform -translate-y-1/2 text-gray-500"
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
          </div>

          <div className="bg-white space-y-3 cursor-pointer">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" className="!rounded-full" />
              <Label
                htmlFor="terms"
                className="text-xs font-light cursor-pointer text-black/70"
              >
                I agree to receive special events, exclusive discount and more
                by Emails
              </Label>
            </div>
            <Button
              variant={"outline"}
              className="w-full !rounded-full text-white hover:!text-white !bg-brand_gradient_light"
              type="submit"
            >
              Register
            </Button>
          </div>
        </form>
        <p className="text-xs mx-auto w-[70%] py-8 text-center">
          By continuing you agree to our{" "}
          <span className="text-[#006ACC] underline cursor-pointer">
            Terms of use
          </span>{" "}
          and acknowledge that you have read our{" "}
          <span className="text-[#006ACC] underline cursor-pointer">
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </section>
  );
}
