import { API_URL, getBearerToken } from "@/lib/api";
import axios from "axios";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface UserProfile {
  _id: string;
  fullname?: string;
  email: string;
  authProvider: "google" | "email";
  isVerified: boolean;
  googleId?: string;
  agreeToReceiveEmails: boolean;
  shippingAddress?: ShippingAddress;
}

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  password?: string;
}

export type ProfileUpdateResult =
  | { requiresVerification: false; profile: UserProfile }
  | { requiresVerification: true; message: string };

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getBearerToken()}` },
});

const errorMessage = (err: unknown, fallback: string) =>
  (axios.isAxiosError(err) && (err.response?.data?.message || err.response?.data?.error)) ||
  fallback;

export async function fetchProfile(): Promise<UserProfile> {
  const res = await axios.get(`${API_URL}/profile`, authHeaders());
  return res.data.message ?? res.data.data;
}

export async function updateProfile(
  payload: ProfileUpdatePayload,
): Promise<ProfileUpdateResult> {
  try {
    const res = await axios.patch(`${API_URL}/profile`, payload, authHeaders());
    if (res.data?.requiresVerification) {
      return { requiresVerification: true, message: res.data.message };
    }
    return { requiresVerification: false, profile: res.data.data };
  } catch (err) {
    throw new Error(errorMessage(err, "Couldn't save your changes. Please try again."));
  }
}

export async function updateShippingAddress(
  shippingAddress: ShippingAddress,
): Promise<void> {
  try {
    await axios.patch(
      `${API_URL}/shipping-address`,
      { shippingAddress },
      authHeaders(),
    );
  } catch (err) {
    throw new Error(errorMessage(err, "Couldn't save your changes. Please try again."));
  }
}

export async function verifyProfileEmailChange(token: string, email: string): Promise<void> {
  try {
    await axios.post(`${API_URL}/auth/verify-email`, { token, email }, authHeaders());
  } catch (err) {
    throw new Error(errorMessage(err, "Invalid or expired verification code."));
  }
}

export async function resendProfileEmailVerification(): Promise<void> {
  try {
    await axios.post(`${API_URL}/profile/resend-verification`, {}, authHeaders());
  } catch (err) {
    throw new Error(errorMessage(err, "Couldn't resend the code. Please try again."));
  }
}
