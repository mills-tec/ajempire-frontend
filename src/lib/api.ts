// lib/api.ts
const AUTH_API_URL = "https://ajempire-backend.vercel.app/api";

export async function loginBackend(email: string, password: string) {
  const res = await fetch(AUTH_API_URL + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    // credentials: "include", // so cookies (session) are set
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function emailVerification(email: string, token: string) {
  const res = await fetch(AUTH_API_URL + "/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
  });
  if (!res.ok) throw new Error("Email verification failed");
  return res.json();
}

export async function emailPasswordVerification(email: string, token: string) {
  const res = await fetch(AUTH_API_URL + "/auth/verify-reset-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
  });
  if (!res.ok) throw new Error("Email verification failed");
  return res.json();
}

export async function phoneNumberBackend(phone: string) {
  const res = await fetch(AUTH_API_URL + "/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) throw new Error("Phone number verification failed");
  return res.json();
}

export async function googleVerification(token: string) {
  const res = await fetch(AUTH_API_URL + "/api/auth/google/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error("Email verification failed");
  return res.json();
}

export async function resendVerificationCode(email: string) {
  const res = await fetch(AUTH_API_URL + "/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to resend verification code");
  return res.json();
}

export async function fogortPassword(email: string) {
  const res = await fetch(AUTH_API_URL + "/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to send verification code");
  return res.json();
}

export async function signupBackend(email: string, password: string) {
  const res = await fetch(AUTH_API_URL + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    // credentials: "include", // so cookies (session) are set
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function logoutBackend() {
  await fetch(process.env.AUTH_API_URL + "/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function getSessionBackend() {
  const res = await fetch(process.env.AUTH_API_URL + "/session", {
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}
