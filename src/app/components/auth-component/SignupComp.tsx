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
import { CloseIcon } from "@/components/svgs/CloseIcon";
import { signupBackend } from "@/lib/api";
import { toast } from "sonner";
import Spinner from "../Spinner";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});
interface SignupCompProps {
  onClose: () => void;
  setScreen: (
    screen:
      | "intro"
      | "signin"
      | "signup"
      | "phonenumber"
      | "forgotpassword"
      | "verifyemail"
      | "verifyphone"
  ) => void;
}

export default function SignupComp({ onClose, setScreen }: SignupCompProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    setIsLoading(true);
    e.preventDefault();
    const result = schema.safeParse(form);

    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0])
          fieldErrors[err.path[0] as "email" | "password"] = err.message;
      });
      setErrors(fieldErrors);
      return; // stop here if validation failed
    }

    try {
      const { email, password } = form;
      const res = await signupBackend(email, password);
      localStorage.setItem("ajempire_signup_email", JSON.stringify(email));
      console.log("res: ", res);
      setErrors({});
      toast("Form submitted successfully!");
      setIsLoading(false);
      setScreen("verifyemail");
      // router.push("/dashboard");
    } catch (err) {
      toast("Signup failed");
      setIsLoading(false);
    }
  }

  return (
    <section className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {isLoading && <Spinner />}
      <div className="relative bg-white rounded-3xl flex flex-col justify-between size-full lg:h-[30rem] lg:w-[27rem]">
        <Image
          src={Logo}
          alt=""
          className="mx-auto py-8"
          width={103}
          height={48}
        />
        <form
          className="w-[80%] mx-auto text-left space-y-8"
          onSubmit={handleSubmit}
        >
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
                className="!text-sm lg:text-base"
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
                className="pr-10 !text-sm lg:text-base"
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
            <button
              className={`w-full py-2 text-base !rounded-full text-white hover:!text-white ${
                isLoading ||
                errors.email ||
                errors.password ||
                form.email.trim().length == 0 ||
                form.password.trim().length == 0
                  ? "!bg-brand_gradient_light"
                  : "!bg-brand_pink"
              }`}
              type="submit"
              disabled={
                isLoading ||
                !!errors.email ||
                !!errors.password ||
                form.email.trim().length === 0 ||
                form.password.trim().length === 0
              }
            >
              Register
            </button>
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
        <div className="absolute top-4 right-4 cursor-pointer">
          <CloseIcon className="w-6 text-black opacity-80" onClick={onClose} />
        </div>
      </div>
    </section>
  );
}
