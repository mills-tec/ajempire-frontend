export type AuthScreen =
  | "intro"
  | "signin"
  | "signup"
  | "phonenumber"
  | "forgotpassword"
  | "verifyemail"
  | "verifyphone"
  | "verifypassresetcode"
  | "deals"
  | "newpassword";

export interface AuthStepProps {
  onClose: () => void;
  onBack: () => void;
  canGoBack: boolean;
  setScreen: (screen: AuthScreen) => void;
}
