"use client";
import {
  fetchProfile,
  ProfileUpdatePayload,
  resendProfileEmailVerification,
  updateProfile,
  updateShippingAddress,
  verifyProfileEmailChange,
} from "@/lib/profileApi";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import VerificationModal from "./VerificationModal";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isFullName = (value: string) => value.trim().split(/\s+/).filter(Boolean).length >= 2;
const isValidEmailFormat = (value: string) => EMAIL_REGEX.test(value.trim());

interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface UserProfile {
  _id: string;
  fullname?: string;
  email: string;
  authProvider: "google" | "email";
  isVerified: boolean;
  googleId?: string;
  agreeToReceiveEmails: boolean;
  shippingAddress?: ShippingAddress;
}

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
};

const ADDRESS_FIELDS: { key: keyof ShippingAddress; label: string; type?: string }[] = [
  { key: "fullName", label: "Recipient Name" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "street", label: "Street" },
  { key: "city", label: "City / Town" },
  { key: "state", label: "State" },
  { key: "country", label: "Country" },
  { key: "postalCode", label: "Postal Code" },
];

type Tab = "profile" | "shipping";

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaved: (updated: UserProfile) => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [agreeToReceiveEmails, setAgreeToReceiveEmails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const { setUser, user } = useAuthStore()

  const canChangePassword = profile.authProvider === "email";

  const isNameDirty = name.trim() !== (profile.fullname ?? "").trim();
  const isEmailDirty = email.trim() !== (profile.email ?? "").trim();
  const isPasswordDirty = canChangePassword && newPassword.length > 0;
  const isProfileDirty = isNameDirty || isEmailDirty || isPasswordDirty;

  // Reset the form from the latest profile every time the sheet opens, so a
  // cancelled edit never leaks into the next time it's opened.
  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("profile");
    setName(profile.fullname ?? "");
    setNameError("");
    setEmail(profile.email ?? "");
    setEmailError("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setAddress({ ...EMPTY_ADDRESS, ...profile.shippingAddress });
    setAgreeToReceiveEmails(profile.agreeToReceiveEmails);
  }, [isOpen, profile]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleAddressChange = (key: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
  };

  const handleNameBlur = () => {
    setNameError(isFullName(name) ? "" : "Please enter your full name (first and last name).");
  };

  const handleEmailBlur = () => {
    setEmailError(isValidEmailFormat(email) ? "" : "Please enter a valid email address.");
  };

  const handleVerificationCancel = () => {
    setIsVerificationOpen(false);
    setPendingEmail("");
  };

  const handleVerified = async () => {
    try {
      const updated = await fetchProfile();
      onSaved(updated);
      setUser({ email: updated.email, name: updated.fullname ?? "", id: updated._id });
      toast.success("Profile updated");
    } catch (err) {
      console.error("Error refreshing profile:", err);
      toast.error("Verified, but couldn't refresh your profile. Please reload the page.");
    } finally {
      setIsVerificationOpen(false);
      setPendingEmail("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleProfileSubmit = async () => {
    if (!isFullName(name)) {
      setNameError("Please enter your full name (first and last name).");
      return;
    }
    if (!isValidEmailFormat(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setPasswordError("");
    if (canChangePassword && newPassword) {
      if (newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }
    }

    if (!isProfileDirty) return;

    setIsSaving(true);
    try {
      const payload: ProfileUpdatePayload = {};
      if (isNameDirty) payload.name = name.trim();
      if (isEmailDirty) payload.email = email.trim();
      if (canChangePassword && newPassword) payload.password = newPassword;

      const result = await updateProfile(payload);

      if (result.requiresVerification) {
        setPendingEmail(email.trim());
        setIsVerificationOpen(true);
        onClose();
      } else {
        onSaved(result.profile);
        setUser({ email: result.profile.email, name: result.profile.fullname ?? "", id: result.profile._id });
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Profile updated");
        onClose();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err instanceof Error ? err.message : "Couldn't save your changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShippingSubmit = async () => {
    setIsSaving(true);
    try {
      await updateShippingAddress(address);
      onSaved({ ...profile, shippingAddress: address });
      toast.success("Profile updated");
      onClose();
    } catch (err) {
      console.error("Error updating shipping address:", err);
      toast.error(err instanceof Error ? err.message : "Couldn't save your changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (activeTab === "profile") {
      await handleProfileSubmit();
    } else {
      await handleShippingSubmit();
    }
  };

  return (
    <>
    <div
      className={`fixed inset-0 z-[100] font-poppins transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet / card */}
      <div className="absolute inset-0 flex items-end md:items-center justify-center">
        <div
          className={`relative w-full md:w-[480px] max-h-[92vh] md:max-h-[85vh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen
            ? "translate-y-0 md:scale-100 opacity-100"
            : "translate-y-full md:translate-y-0 md:scale-95 opacity-0"
            }`}
        >
          {/* Drag handle (mobile) */}
          <div className="md:hidden flex justify-center pt-3">
            <div className="w-10 h-1.5 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-4 pb-3">
            <h2 className="text-[17px] font-semibold text-gray-900">Edit Profile</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors duration-200"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs — iOS-style segmented control */}
          <div className="px-6 pb-3">
            <div className="relative flex bg-gray-100 rounded-xl p-1">
              <div
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${activeTab === "shipping" ? "translate-x-full" : "translate-x-0"
                  }`}
              />
              {(["profile", "shipping"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative z-10 flex-1 py-2 text-[13px] font-medium rounded-lg transition-colors duration-200 ${activeTab === tab ? "text-gray-900" : "text-gray-500"
                    }`}
                >
                  {tab === "profile" ? "Profile" : "Shipping"}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 pb-5 border-t border-gray-100">
              {/* Profile tab */}
              <div
                className={`flex flex-col gap-6 pt-5 transition-all duration-200 ${activeTab === "profile" ? "opacity-100" : "hidden opacity-0"
                  }`}
              >
                <div>
                  <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">
                    Account
                  </p>
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 divide-y divide-gray-200/70">
                    <div className="py-2.5">
                      <label htmlFor="name" className="block text-[11px] text-gray-400 mb-0.5">
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (nameError) setNameError("");
                        }}
                        onBlur={handleNameBlur}
                        placeholder="Your name"
                        aria-invalid={!!nameError}
                        className="w-full bg-transparent text-[14px] font-medium text-gray-800 placeholder:text-gray-300 outline-none"
                      />
                      {nameError && (
                        <p className="text-[12px] text-red-500 mt-1">{nameError}</p>
                      )}
                    </div>
                    <div className="py-2.5">
                      <label htmlFor="email" className="block text-[11px] text-gray-400 mb-0.5">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        onBlur={handleEmailBlur}
                        placeholder="you@example.com"
                        aria-invalid={!!emailError}
                        className="w-full bg-transparent text-[14px] font-medium text-gray-800 placeholder:text-gray-300 outline-none"
                      />
                      {emailError && (
                        <p className="text-[12px] text-red-500 mt-1">{emailError}</p>
                      )}
                    </div>
                  </div>
                  {isEmailDirty && !emailError && (
                    <p className="text-[12px] text-gray-400 mt-1.5 px-1">
                      You&apos;ll need to verify this new email before it takes effect.
                    </p>
                  )}
                </div>

                {canChangePassword && (
                  <div>
                    <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">
                      Password
                    </p>
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 divide-y divide-gray-200/70">
                      <div className="py-2.5">
                        <label htmlFor="newPassword" className="block text-[11px] text-gray-400 mb-0.5">
                          New Password
                        </label>
                        <input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Leave blank to keep current password"
                          className="w-full bg-transparent text-[14px] font-medium text-gray-800 placeholder:text-gray-300 outline-none"
                        />
                      </div>
                      <div className="py-2.5">
                        <label htmlFor="confirmPassword" className="block text-[11px] text-gray-400 mb-0.5">
                          Confirm New Password
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full bg-transparent text-[14px] font-medium text-gray-800 placeholder:text-gray-300 outline-none"
                        />
                      </div>
                    </div>
                    {passwordError && (
                      <p className="text-[12px] text-red-500 mt-1.5 px-1">{passwordError}</p>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">
                    Preferences
                  </p>
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4">
                    <div className="flex items-center justify-between py-3.5">
                      <div className="pr-4">
                        <p className="text-[14px] font-medium text-gray-800">Email updates</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">
                          Offers, order updates, and news
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={agreeToReceiveEmails}
                        onClick={() => setAgreeToReceiveEmails((prev) => !prev)}
                        className={`relative w-[46px] h-[28px] rounded-full shrink-0 transition-colors duration-300 ${agreeToReceiveEmails ? "bg-brand_pink" : "bg-gray-300"
                          }`}
                      >
                        <span
                          className={`absolute top-[3px] left-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-transform duration-300 ${agreeToReceiveEmails ? "translate-x-[18px]" : "translate-x-0"
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping tab */}
              <div
                className={`flex flex-col gap-6 pt-5 transition-all duration-200 ${activeTab === "shipping" ? "opacity-100" : "hidden opacity-0"
                  }`}
              >
                <div>
                  <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">
                    Delivery Details
                  </p>
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 divide-y divide-gray-200/70">
                    {ADDRESS_FIELDS.map(({ key, label, type }) => (
                      <div key={key} className="py-2.5">
                        <label htmlFor={key} className="block text-[11px] text-gray-400 mb-0.5">
                          {label}
                        </label>
                        <input
                          id={key}
                          type={type ?? "text"}
                          value={address[key]}
                          onChange={(e) => handleAddressChange(key, e.target.value)}
                          placeholder={label}
                          className="w-full bg-transparent text-[14px] font-medium text-gray-800 placeholder:text-gray-300 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white">
              <button
                type="submit"
                disabled={isSaving || (activeTab === "profile" && !isProfileDirty)}
                className="w-full h-12 rounded-2xl bg-brand_pink text-white text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <VerificationModal
      isOpen={isVerificationOpen}
      email={pendingEmail}
      onCancel={handleVerificationCancel}
      onVerify={verifyProfileEmailChange}
      onVerified={handleVerified}
      onResend={resendProfileEmailVerification}
    />
    </>
  );
}
