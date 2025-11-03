"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import IntroComp from "./IntroComp";
import SigninComp from "./SigninComp";
import SignupComp from "./SignupComp";
import PhoneNumberComp from "./PhoneNumberComp";
import ForgotPassword from "./ForgotPassword";
import VerifyEmailComp from "./VerifyEmailComp";
import VerifyPhoneComp from "./VerifyPhoneComp";
import VerifyPasswordResetCode from "./VerifyPasswordResetCode";
import NewPassword from "./NewPassword";
interface AuthWrapperProps {
  onClose: () => void;
}

export default function AuthWrapper({ onClose }: AuthWrapperProps) {
  // const router = useRouter();
  const [screen, setScreen] = useState<
    | "intro"
    | "signin"
    | "signup"
    | "phonenumber"
    | "forgotpassword"
    | "verifyemail"
    | "verifyphone"
    | "verifypassresetcode"
    | "deals"
    | "newpassword"
  >("intro");
  function handleClose() {
    // Go back to previous page if available, otherwise go to home
    onClose();
  }
  return (
    <div>
      {screen === "intro" && (
        <IntroComp setScreen={setScreen} onClose={handleClose} />
      )}
      {screen === "signin" && (
        <SigninComp setScreen={setScreen} onClose={handleClose} />
      )}
      {screen === "signup" && (
        <SignupComp setScreen={setScreen} onClose={handleClose} />
      )}
      {screen === "phonenumber" && (
        <PhoneNumberComp setScreen={setScreen} onClose={handleClose} />
      )}
      {screen === "forgotpassword" && (
        <ForgotPassword setScreen={setScreen} onClose={handleClose} />
      )}
      {screen === "verifyemail" && (
        <VerifyEmailComp setScreen={setScreen} onClose={handleClose} />
      )}
      {screen === "verifyphone" && (
        <VerifyPhoneComp setScreen={setScreen} onClose={handleClose} />
      )}
      {screen === "verifypassresetcode" && (
        <VerifyPasswordResetCode setScreen={setScreen} onClose={handleClose} />
      )}
      {screen === "newpassword" && (
        <NewPassword setScreen={setScreen} onClose={handleClose} />
      )}
    </div>
  );
}
