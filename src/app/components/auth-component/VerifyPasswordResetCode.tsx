"use client";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { verifyPasswordResetCode } from "@/lib/api";
import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Spinner from "../Spinner";

interface Props {
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
      | "newpassword"
  ) => void;
}

export default function VerifyPasswordResetCode({ onClose, setScreen }: Props) {
  const [otp, setOtp] = useState("");
  const maxLength = 6;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function handleOTPChange(value: string) {
    // Only allow numeric input and up to maxLength
    const sanitized = value.replace(/\D/g, "").slice(0, maxLength);
    setOtp(sanitized);
  }

  async function handleOTPSubmit(code: string) {
    setIsLoading(true);
    try {
      const email = localStorage.getItem("ajempire_signup_email");
      if (!email) return toast("Couldn't verify token!");
      const res = await verifyPasswordResetCode(email, code);
      console.log("response: ", res);
      if (res.error) return toast(res.error);
      setIsLoading(false);
      setScreen("newpassword");
      toast("Token verified successfully!");
    } catch (error) {
      setIsLoading(false);
      toast("Couldn't verify token!");
    }
    // router.push("/auth/new-password");
  }

  useEffect(() => {
    if (otp.length === maxLength) {
      handleOTPSubmit(otp);
    }
  }, [otp]);

  return (
    <section className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {isLoading && <Spinner />}
      <div className="bg-white flex flex-col rounded-3xl size-full lg:h-[30rem] lg:w-[27rem]">
        <div className="flex justify-between border-b px-4 border-b-black/10 pt-10 pb-3">
          <div></div>
          <h1>Enter the password to reset code</h1>
          <X onClick={onClose} className="h-4 cursor-pointer" />
        </div>

        <div className="flex-1 flex flex-col py-16 justify-between h-full">
          <div className="space-y-10">
            <div className="w-[70%] mx-auto space-y-2">
              <p className="text-xs text-[#838383]">
                To continue, complete this verification step. We’ve sent a
                password reset code to the email{" "}
                <span className="text-black text-brand font-medium">
                  {localStorage.getItem("ajempire_signup_email") ||
                    "your email"}
                </span>
                . Please enter it below. We’ve sent a verification code to your
                email{" "}
              </p>
            </div>

            <div className="mx-auto w-[70%] space-y-2">
              <div className="flex items-center justify-center">
                <InputOTP
                  maxLength={maxLength}
                  className="!w-full flex !mx-auto"
                  value={otp}
                  onChange={handleOTPChange}
                >
                  {[...Array(maxLength)].map((_, idx) => (
                    <InputOTPSlot
                      key={idx}
                      className="border border-black/40 rounded-md"
                      index={idx}
                    />
                  ))}
                </InputOTP>
              </div>
              <p className="text-xs text-center text-black/60">
                37s Resend code
              </p>
            </div>
          </div>

          <div className="text-xs mx-auto w-[70%] py-8">
            <p>Didn’t receive the code?</p>
            <p className="pl-1">1. Make sure your email address is correct</p>
            <p className="pl-1">2. Please check your spam folder.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
