import { CartItem } from "./stores/cart-store";
import { Product, ProductResponse, ProductsResponse } from "./types";

// lib/api.ts
const API_URL = "https://ajempire-backend.vercel.app/api";

export async function loginBackend(email: string, password: string) {
  const res = await fetch(API_URL + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    // credentials: "include", // so cookies (session) are set
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function emailVerification(email: string, token: string) {
  const res = await fetch(API_URL + "/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
  });
  if (!res.ok) throw new Error("Email verification failed");
  return res.json();
}

export async function emailPasswordVerification(email: string, token: string) {
  const res = await fetch(API_URL + "/auth/verify-reset-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
  });
  if (!res.ok) throw new Error("Email verification failed");
  return res.json();
}

export async function phoneNumberBackend(phone: string) {
  const res = await fetch(API_URL + "/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) throw new Error("Phone number verification failed");
  return res.json();
}

export async function googleVerification(token: string) {
  const res = await fetch(API_URL + "/api/auth/google/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error("Email verification failed");
  return res.json();
}

export async function resendVerificationCode(email: string) {
  const res = await fetch(API_URL + "/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to resend verification code");
  return res.json();
}

export async function verifyPasswordResetCode(email: string, token: string) {
  const res = await fetch(API_URL + "/auth/verify-reset-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
  });
  if (!res.ok) throw new Error("Failed to resend verification code");
  return res.json();
}

export async function fogortPassword(email: string) {
  const res = await fetch(API_URL + "/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to send verification code");
  return res.json();
}

export async function signupBackend(email: string, password: string) {
  const res = await fetch(API_URL + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    // credentials: "include", // so cookies (session) are set
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function logoutBackend() {
  await fetch(API_URL + "/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function getSessionBackend() {
  const res = await fetch(API_URL + "/session", {
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}

/// Product API
export async function getProducts(): Promise<ProductsResponse | null> {
  const res = await fetch(API_URL + "/product");
  if (!res.ok) return null;
  return res.json();
}

export async function getProduct(id: string): Promise<ProductResponse | null> {
  const res = await fetch(API_URL + "/product/" + id);
  if (!res.ok) return null;
  return res.json();
}

export function getBearerToken() {
  const userStr = localStorage.getItem("ajempire_signin_user");
  return userStr ? JSON.parse(userStr)?.token : null;
}

// Cart API
export async function addToCart(products: CartItem[]) {
  const token = getBearerToken();
  if (!token) throw new Error("User not authenticated");

  const items = products.map((product) => ({
    productId: product._id,
    qty: product.quantity,
    variant: product.selectedVariants,
  }));
  const res = await fetch(API_URL + "/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error("Cart update failed");
  return res.json();
}

export async function removeCartItem(id: string) {
  const token = getBearerToken();
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(API_URL + "/cart/" + id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  return res.json();
}

// WISHLIST API
export async function addToWishlistAPI(productId: string) {
  const token = getBearerToken();
  if (!token) throw new Error("User not authenticated");

  const wishlist = await getUsersWishlist();
  if (!wishlist) throw new Error("Failed to add to wishlist");

  const wishlistIDs = wishlist.message.map((item) => item.product._id);

  console.log("wishlist: ", wishlist);

  const res = await fetch(`${API_URL}/wishlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ products: [productId] }),
  });

  if (!res.ok) throw new Error("Failed to add to wishlist");
  return res.json();
}

export async function getUsersWishlist(): Promise<{
  message: { product: Product; _id: string }[];
}> {
  const token = getBearerToken();
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_URL}/wishlist`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to get to wishlist");
  return res.json();
}

export async function removeFromWishlistAPI(productId: string) {
  const token = getBearerToken();
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_URL}/wishlist/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to remove item from wishlist");
  return res.json();
}
