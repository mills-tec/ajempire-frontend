"use client";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerificationModal({
  isOpen,
  email,
  onCancel,
  onVerify,
  onVerified,
  onResend,
}: {
  isOpen: boolean;
  email: string;
  onCancel: () => void;
  onVerify: (code: string, email: string) => Promise<void>;
  onVerified: () => void;
  onResend: () => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (!isOpen) return;
    setCode("");
    setError("");
    setIsVerifying(false);
    setIsResending(false);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [isOpen, cooldown]);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (isVerifying || code.length !== 6) return;
    setIsVerifying(true);
    setError("");
    try {
      await onVerify(code, email);
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResending || cooldown > 0) return;
    setIsResending(true);
    setError("");
    try {
      await onResend();
      toast.success("Verification code sent.");
      setCode("");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resend the code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const isBusy = isVerifying || isResending;

  return (
    <div className="fixed inset-0 z-[110] font-poppins flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isBusy && onCancel()} />

      <div className="relative w-full md:w-[420px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="md:hidden flex justify-center pt-3">
          <div className="w-10 h-1.5 rounded-full bg-gray-300" />
        </div>

        <div className="px-6 pt-5 pb-6 flex flex-col gap-5">
          <div>
            <h2 className="text-[17px] font-semibold text-gray-900">Verify your new email</h2>
            <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
              We&apos;ve sent a verification code to{" "}
              <span className="font-medium text-gray-800">{email}</span>. Enter the
              verification code below to complete your profile update.
            </p>
          </div>

          <fieldset disabled={isBusy} className="flex flex-col items-center gap-3">
            <InputOTP maxLength={6} value={code} onChange={setCode} className="!w-full flex !mx-auto">
              <InputOTPSlot className="border border-black/40 rounded-md" index={0} />
              <InputOTPSlot className="border border-black/40 rounded-md" index={1} />
              <InputOTPSlot className="border border-black/40 rounded-md" index={2} />
              <InputOTPSlot className="border border-black/40 rounded-md" index={3} />
              <InputOTPSlot className="border border-black/40 rounded-md" index={4} />
              <InputOTPSlot className="border border-black/40 rounded-md" index={5} />
            </InputOTP>
          </fieldset>

          {error && <p className="text-[12px] text-red-500 -mt-2">{error}</p>}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleVerify}
              disabled={isBusy || code.length !== 6}
              className="w-full h-12 rounded-2xl bg-brand_pink text-white text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {isVerifying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={isBusy || cooldown > 0}
              className="w-full h-11 rounded-2xl text-[14px] font-medium text-gray-600 disabled:text-gray-400 hover:bg-gray-50 transition-colors duration-200"
            >
              {isResending
                ? "Resending..."
                : cooldown > 0
                  ? `Resend Code (${cooldown}s)`
                  : "Resend Code"}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isBusy}
              className="w-full h-11 rounded-2xl text-[14px] font-medium text-gray-400 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
