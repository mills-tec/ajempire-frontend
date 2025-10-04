"use client";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { emailVerification, resendVerificationCode } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
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
  ) => void;
}

export default function VerifyEmailComp({ onClose, setScreen }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  let email = searchParams.get("email");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend functionality
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleVerification = async () => {
    email = localStorage.getItem("ajempire_signup_email");
    if (!email) {
      toast.error("Email not found. Please try signing up again.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await emailVerification(email, otp);
      toast.success("Email verified successfully!");
      //   router.push("/auth/signin");
      setScreen("signin");
    } catch (error) {
      console.log("error: ", error);
      toast.error("Invalid verification code. Please try again.");
      console.error("Verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email not found. Please try signing up again.");
      return;
    }

    try {
      await resendVerificationCode(email);
      toast.success("Verification code sent successfully!");
      setResendTimer(60);
      setCanResend(false);
      setOtp("");
    } catch (error) {
      toast.error("Failed to resend verification code. Please try again.");
      console.error("Resend error:", error);
    }
  };

  return (
    <section className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {isVerifying && <Spinner />}
      <div className="bg-white flex flex-col rounded-3xl size-full lg:h-[30rem] lg:w-[27rem]">
        <div className="flex justify-between border-b px-4 border-b-black/10 pt-10 pb-3">
          <div></div>
          <h1>Verify your account</h1>
          <button
            onClick={() => router.push("/auth/signin")}
            className="cursor-pointer text-sm hover:text-gray-600"
          >
            Skip
          </button>
        </div>

        <div className="flex-1 flex flex-col py-8 justify-between h-full">
          <div className="space-y-10">
            <div className="w-[70%] mx-auto space-y-2">
              <h1>Enter your verification code</h1>
              <p className="text-xs text-[#838383]">
                Verifying your email adds an extra layer of Security and ensures
                important notifications reach you <br />
                <br />
                We've sent a verification code to your email{" "}
                <b className="text-black font-medium">
                  {localStorage.getItem("ajempire_signup_email") ||
                    email ||
                    "your email"}
                </b>
              </p>
            </div>

            <div className="mx-auto w-[70%] space-y-4">
              <div className="flex items-center justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  className="!w-full flex !mx-auto"
                >
                  <InputOTPSlot
                    className="border border-black/40 rounded-md"
                    index={0}
                  />
                  <InputOTPSlot
                    className="border border-black/40 rounded-md"
                    index={1}
                  />
                  <InputOTPSlot
                    className="border border-black/40 rounded-md"
                    index={2}
                  />
                  <InputOTPSlot
                    className="border border-black/40 rounded-md"
                    index={3}
                  />
                  <InputOTPSlot
                    className="border border-black/40 rounded-md"
                    index={4}
                  />
                  <InputOTPSlot
                    className="border border-black/40 rounded-md"
                    index={5}
                  />
                </InputOTP>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={handleVerification}
                  disabled={isVerifying || otp.length !== 6}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isVerifying || otp.length !== 6
                      ? "bg-brand_gradient_light text-gray-500 cursor-not-allowed"
                      : "bg-brand_pink text-white hover:bg-gray-800"
                  }`}
                >
                  {isVerifying ? "Verifying..." : "Verify Email"}
                </button>

                <p className="text-xs text-center text-black/60">
                  {canResend ? (
                    <button
                      onClick={handleResendCode}
                      className="text-[#006ACC] hover:underline"
                    >
                      Resend code
                    </button>
                  ) : (
                    `${resendTimer}s Resend code`
                  )}
                </p>
              </div>
            </div>
          </div>

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
      </div>
    </section>
  );
}
