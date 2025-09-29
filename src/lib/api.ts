// lib/api.ts
const AUTH_API_URL = "https://ajempire-backend.onrender.com";

export async function loginBackend(email: string, password: string) {
  const res = await fetch(process.env.AUTH_API_URL + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include", // so cookies (session) are set
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function signupBackend(email: string, password: string) {
  const res = await fetch(AUTH_API_URL + "/auth/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include", // so cookies (session) are set
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
