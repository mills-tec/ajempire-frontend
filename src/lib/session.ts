// lib/session.ts
import { getSessionBackend } from "./api";

export async function getSession() {
  return await getSessionBackend(); // your backend is source of truth
}
