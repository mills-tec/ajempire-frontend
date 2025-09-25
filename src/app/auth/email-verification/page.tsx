import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";

export default function EmailVerificationPage() {
  return (
    <section className="bg-brand_gray/20 h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="bg-white flex flex-col rounded-3xl min-h-[30rem] w-[27rem]">
        <div className="flex justify-between border-b px-4 border-b-black/10 pt-10 pb-3">
          <div></div>
          <h1>Verify your account</h1>
          <p className="cursor-pointer text-sm">Skip</p>
        </div>

        <div className="flex-1 flex flex-col py-8 justify-between h-full">
          <div className="space-y-10">
            <div className="w-[70%] mx-auto space-y-2">
              <h1>Enter your verification code</h1>
              <p className="text-xs text-[#838383]">
                Verifying your email adds an extra layer of Security and ensures
                important notifications reach you <br />
                <br />
                We’ve sent a verification code to your email{" "}
                <b className="text-black font-medium">
                  nooblegold042@gmail.com
                </b>
              </p>
            </div>

            <div className="mx-auto w-[70%] space-y-2">
              <div className="flex items-center justify-center">
                <InputOTP maxLength={6} className="!w-full flex !mx-auto">
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
              <p className="text-xs text-center text-black/60">
                37s Resend code
              </p>
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
