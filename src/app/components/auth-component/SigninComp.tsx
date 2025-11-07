"use client";
import Image from "next/image";
import Logo from "@/assets/logo.png";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { email, z } from "zod";
import { Eye, EyeClosed } from "lucide-react";
import { CloseIcon } from "@/components/svgs/CloseIcon";
import { loginBackend } from "@/lib/api";
import { toast } from "sonner";
import Spinner from "../Spinner";
import { useAuthStore } from "@/lib/stores/auth-store";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

interface SigninCompProps {
  onClose: () => void;
  setScreen: (
    screen: "intro" | "signin" | "phonenumber" | "signup" | "forgotpassword"
  ) => void;
}

export default function SigninComp({ onClose, setScreen }: SigninCompProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

  const { setIsLoggedIn, setUser } = useAuthStore();

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
      const res = await loginBackend(email, password);
      // Store JWT token in localStorage (accessible to JS, but not httpOnly)
      if (res?.message) {
        res.message.token ? setIsLoggedIn(true) : setIsLoggedIn(false);
        setUser({ email: res.message.user.email, name: "" });
        localStorage.setItem(
          "ajempire_signin_user",
          JSON.stringify(res.message)
        );
      }
      console.log("res: ", res);
      setErrors({});
      toast("Login successful!");
      setIsLoading(false);
      onClose();
      // router.push("/dashboard");
    } catch (err) {
      toast("Login failed");
      setIsLoading(false);
    }
  }

  return (
    <section className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {isLoading && <Spinner />}
      <div className=" relative bg-white rounded-3xl flex flex-col justify-between h-full w-full lg:h-[30rem] lg:w-[27rem] text-3xl">
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
                className="absolute right-2 top-[55px] transform -translate-y-1/2 text-gray-500"
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

          <div className="bg-white">
            <button
              className={`w-full !rounded-full text-base py-2 text-white hover:!text-white ${
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
              Continue
            </button>
            <div>
              {" "}
              <Button
                variant={"link"}
                className="w-full !rounded-full font-light text-black"
                onClick={() => setScreen("forgotpassword")}
              >
                Forgot Password ?
              </Button>
            </div>
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
