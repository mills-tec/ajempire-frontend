"use client";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PasswordResetVerificationPage() {
  const [otp, setOtp] = useState("");
  const maxLength = 6;
  const router = useRouter();

  function handleOTPChange(value: string) {
    // Only allow numeric input and up to maxLength
    const sanitized = value.replace(/\D/g, "").slice(0, maxLength);
    setOtp(sanitized);
  }

  function handleOTPSubmit(code: string) {
    // Replace this with your actual submit logic
    // e.g., call API or navigate to next step
    alert(`OTP submitted:${code}`);
    router.push("/auth/new-password");
  }

  useEffect(() => {
    if (otp.length === maxLength) {
      handleOTPSubmit(otp);
    }
  }, [otp]);

  return (
    <section className="bg-brand_gray/20 h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="bg-white flex flex-col rounded-3xl size-full lg:h-[30rem] lg:w-[27rem]">
        <div className="flex justify-between border-b px-4 border-b-black/10 pt-10 pb-3">
          <div></div>
          <h1>Enter the password to reset code</h1>
          <Link href={"forgot-password"}>
            <X className="h-4 cursor-pointer" />
          </Link>
        </div>

        <div className="flex-1 flex flex-col py-16 justify-between h-full">
          <div className="space-y-10">
            <div className="w-[70%] mx-auto space-y-2">
              <p className="text-xs text-[#838383]">
                To continue, complete this verification step. We’ve sent a
                password reset code to the email{" "}
                <span className="text-black text-brand font-medium">
                  nooblegold042@gmail.com
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
