"use client";

import { useState } from "react";
import IntroComp from "./IntroComp";
import SigninComp from "./SigninComp";
import SignupComp from "./SignupComp";
import PhoneNumberComp from "./PhoneNumberComp";
import ForgotPassword from "./ForgotPassword";
import VerifyEmailComp from "./VerifyEmailComp";
import VerifyPhoneComp from "./VerifyPhoneComp";
import VerifyPasswordResetCode from "./VerifyPasswordResetCode";
import NewPassword from "./NewPassword";
import type { AuthScreen } from "./auth-flow";

interface AuthWrapperProps {
  onClose: () => void;
}

export default function AuthWrapper({ onClose }: AuthWrapperProps) {
  const [authFlow, setAuthFlow] = useState<{
    screen: AuthScreen;
    history: AuthScreen[];
  }>({
    screen: "intro",
    history: [],
  });

  const { screen, history } = authFlow;

  function handleClose() {
    onClose();
  }

  function handleScreenChange(nextScreen: AuthScreen) {
    setAuthFlow((current) => {
      if (current.screen === nextScreen) {
        return current;
      }

      return {
        screen: nextScreen,
        history: [...current.history, current.screen],
      };
    });
  }

  function handleBack() {
    if (screen === "intro" && history.length === 0) {
      onClose();
      return;
    }

    setAuthFlow((current) => {
      const previousScreen = current.history[current.history.length - 1];

      if (!previousScreen) {
        return {
          screen: "intro",
          history: [],
        };
      }

      return {
        screen: previousScreen,
        history: current.history.slice(0, -1),
      };
    });
  }

  const canGoBack = screen !== "intro";

  return (
    <div>
      {screen === "intro" && (
        <IntroComp setScreen={handleScreenChange} onClose={handleClose} />
      )}
      {screen === "signin" && (
        <SigninComp
          setScreen={handleScreenChange}
          onClose={handleClose}
          onBack={handleBack}
          canGoBack={canGoBack}
        />
      )}
      {screen === "signup" && (
        <SignupComp
          setScreen={handleScreenChange}
          onClose={handleClose}
          onBack={handleBack}
          canGoBack={canGoBack}
        />
      )}
      {screen === "phonenumber" && (
        <PhoneNumberComp
          setScreen={handleScreenChange}
          onClose={handleClose}
          onBack={handleBack}
          canGoBack={canGoBack}
        />
      )}
      {screen === "forgotpassword" && (
        <ForgotPassword
          setScreen={handleScreenChange}
          onClose={handleClose}
          onBack={handleBack}
          canGoBack={canGoBack}
        />
      )}
      {screen === "verifyemail" && (
        <VerifyEmailComp
          setScreen={handleScreenChange}
          onClose={handleClose}
          onBack={handleBack}
          canGoBack={canGoBack}
        />
      )}
      {screen === "verifyphone" && (
        <VerifyPhoneComp
          setScreen={handleScreenChange}
          onClose={handleClose}
          onBack={handleBack}
          canGoBack={canGoBack}
        />
      )}
      {screen === "verifypassresetcode" && (
        <VerifyPasswordResetCode
          setScreen={handleScreenChange}
          onClose={handleClose}
          onBack={handleBack}
          canGoBack={canGoBack}
        />
      )}
      {screen === "newpassword" && (
        <NewPassword
          setScreen={handleScreenChange}
          onClose={handleClose}
          onBack={handleBack}
          canGoBack={canGoBack}
        />
      )}
    </div>
  );
}
