import { postData } from "@/api/api";
import { CartItem } from "./stores/cart-store";
import {
  Category,
  Comment,
  Feed,
  Product,
  ProductResponse,
  ProductsResponse,
} from "./types";
import { ICoupon } from "@/app/pages/ordersandaccount/coupoonsandoffers/page";

export type Coupon = {
  _id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  title: string;
  expiry: string;
  isExpired: boolean;
  users: string[];
};

// lib/api.ts
export const API_URL = "https://ajempire-backend-production.up.railway.app/api";
export const BASE_URL = "https://ajempire-backend-production.up.railway.app";
const DEFAULT_PRODUCTS_LIMIT = 20;

export async function loginBackend(email: string, password: string) {
  console.log("🔑 Login request:", { email, password: "***" });
  
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
  console.log("verification res: ",res)
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
  const res = await fetch(API_URL + "/auth/google", {
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
  console.log("📡 Making signup request:", { email, password: "***" });
  
  const res = await fetch(API_URL + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    // credentials: "include", // so cookies (session) are set
  });
  
  console.log("📊 Response status:", res.status);
  console.log("📊 Response headers:", [...res.headers.entries()]);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("❌ API Error Response:", errorData);
    console.error("📊 Error structure:", JSON.stringify(errorData, null, 2));
    throw new Error(errorData.error || errorData.message || "Signup failed");
  }
  
  const data = await res.json();
  console.log("✅ API Success Response:", data);
  console.log("📊 Response structure:", JSON.stringify(data, null, 2));
  console.log("📊 Response type:", typeof data);
  console.log("📊 Response keys:", Object.keys(data));
  return data;
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
export async function getProducts(
  query: string,
): Promise<ProductsResponse | null> {
  const normalizedQuery = query.trim();
  const queryString = normalizedQuery
    ? normalizedQuery
    : `limit=${DEFAULT_PRODUCTS_LIMIT}`;
  const res = await fetch(`${API_URL}/product?${queryString}`);
  if (!res.ok) return null;
  const resp = await res.json();
  return resp;
}

export async function getProduct(id: string): Promise<ProductResponse> {
  const user = getUser();
  const userQuery = user?._id ? `?user=${encodeURIComponent(user._id)}` : "";
  const res = await fetch(`${API_URL}/product/${id}${userQuery}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function getUpdates(
  type: string,
  cursor: string,
  limit: number,
): Promise<{ data: Feed[]; nextCursor: string; hasMore: boolean } | null> {
  const res = await fetch(
    API_URL + "/updates/" + type + "?limit=" + limit + "&cursor=" + cursor,
  );
  if (!res.ok) return null;

  const response = await res.json();
  return response.message as { data: Feed[]; nextCursor: string; hasMore: boolean };
}

export async function getRelatedProducts(
  category: string,
  query: string,
): Promise<{
  products: Product[];
  nextCursor: string;
  hasMore: boolean;
} | null> {
  const res = await fetch(
    API_URL + "/product/related/" + category + "?" + query,
  );
  if (!res.ok) return null;
  return res.json();
}

export async function getExploreInterest(
  limit: number,
  cursor: string,
): Promise<{
  products: Product[];
  nextCursor: string;
  hasMore: boolean;
} | null> {
  const token = getBearerToken();
  const res = await fetch(
    API_URL + "/products/explore/" + "?limit=" + limit + "&cursor=" + cursor,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );
  if (!res.ok) return null;
  return res.json();
}

export function getBearerToken() {
  const userStr =
    typeof window != "undefined"
      ? localStorage.getItem("ajempire_signin_user")
      : null;
  return userStr ? JSON.parse(userStr)?.token : null;
}

export function getUser(): {
  _id: string;
  email: string;
  fullname: string;
} | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("ajempire_signin_user");
  return userStr ? JSON.parse(userStr)?.user : null;
}

export async function getFeeds(
  cursor: string,
  type: string,
): Promise<Feed[] | null> {
  const res = await fetch(
    API_URL + "/updates/" + type + "?limit=4&cursor=" + cursor,
  );
  if (!res.ok) return null;
  return res.json();
}

const collectDescendants = (root: Comment): Comment[] => {
  const out: Comment[] = [];

  const dfs = (node: Comment) => {
    // iterate over direct children of `node`
    for (const child of node.replies ?? []) {
      // push a shallow copy with replies cleared and parentId set to direct parent
      out.push({ ...child, replies: [], parentId: node._id });
      // recurse to collect child's descendants
      dfs(child);
    }
  };

  dfs(root);
  return out;
};

export const flattenAllComments = (comments: Comment[]): Comment[] => {
  return comments.map((c) => ({
    ...c,
    // keep top-level comment's parentId as-is (probably null),
    // replies becomes a flat array of all descendants
    replies: collectDescendants(c),
  }));
};

//make both comments and replies single arr without first level nesting
export const oneDflattenAllComments = (comments: Comment[]): Comment[] => {
  const flat: Comment[] = [];

  const traverse = (c: Comment) => {
    flat.push({ ...c, replies: [] });
    c.replies.forEach(traverse);
  };

  comments.forEach(traverse);
  return flat;
};

// Cart API
export async function addToCart(products: CartItem[]) {
  const token = getBearerToken();
  if (!token) throw new Error("User not authenticated");

  // Validate that products with variants have selectedVariants
  for (const product of products) {
    if (
      product.variants &&
      product.variants.length > 0 &&
      (!product.selectedVariants ||
        product.selectedVariants.length !== product.variants.length)
    ) {
      throw new Error(
        `Product "${product.name}" requires ${product.variants.length} variants but only ${product.selectedVariants?.length || 0} were selected.`,
      );
    }
  }

  const items = products.map((product) => ({
    productId: product._id,
    qty: product.quantity,
    variants: product.selectedVariants?.length
      ? product.selectedVariants.map((variant) => ({
          name: variant.name,
          value: variant.value,
        }))
      : [],
  }));

  console.log(items);

  // 🔥 Log payload here to check
  // console.log("Sending cart payload:", items);
  const res = await fetch(API_URL + "/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const errorData = await res.text();
    console.error("🔥 BACKEND CART API REJECTED PAYLOAD:", errorData);
    console.error("Sent Payload was:", JSON.stringify({ items }, null, 2));
    throw new Error("Cart update failed: " + errorData);
  }
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

//FEED API
export async function fetchFeed() {
  const token = getBearerToken();
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_URL}/feeds`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
}

export async function likeFeedPost(postId: string) {
  const token = getBearerToken();
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_URL}/feeds/${postId}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to like post");
  return res.json();
}

export async function likeFeedCommentPost(postId: string) {
  const token = getBearerToken();
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_URL}/feeds/${postId}/comment/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to like post");
  return res.json();
}

export async function getCategories(): Promise<{ message: Category[] }> {
  const token = getBearerToken();

  const res = await fetch(`${API_URL}/category`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) throw new Error("Failed to get categories");
  return res.json();
}

export async function getProductsByCategory(
  category: string,
  query?: string,
): Promise<Product[]> {
  const queryString = query ? `?${query}` : "";
  const res = await fetch(
    `${API_URL}/category/${category}/product${queryString}`,
  );
  if (!res.ok) return [];

  const data = await res.json();
  console.log("Products by category response data:", data);
  return data.message.products;
}

// SEARCH API
export async function searchProducts(searchQuery: string): Promise<Product[]> {
  console.log("📡 calling searchProducts with query:", searchQuery);
  const res = await fetch(
    `${API_URL}/product/search?name=${encodeURIComponent(searchQuery)}`,
  );
  if (!res.ok) return [];

  const data = await res.json();
  console.log("Search response data:", data);
  console.log("Message structure:", data.message);

  // The API returns { message: { items: [...], pagination: {...} } }
  if (Array.isArray(data.message?.items)) {
    return data.message.items;
  }

  return [];
}

export async function getCoupons(
  type: string,
): Promise<{ message: ICoupon[] } | null> {
  try {
    const token = getBearerToken();
    const res = await fetch(`${API_URL}/coupons/${type}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch coupons");
      return null;
    }

    const data = await res.json();
    console.log("Coupons response:", data);

    return data;
  } catch (error) {
    console.error("Coupon fetch error:", error);
    return null;
  }
}

export async function applyCouponCode(code: string): Promise<{
  message: {
    _id: string;
    code: string;
    discountType: "fixed" | "percentage"; // adjust if only fixed is allowed
    discountValue: number;
    title: string;
    expiry: string; // ISO date string
    isExpired: boolean;
    usedBy: string[]; // assuming array of user IDs
    __v: number;
  };
} | null> {
  try {
    const token = getBearerToken();
    const res = await postData(
      `/coupon/apply`,
      { code },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res;

    return data.data;
  } catch (error) {
    console.error("Coupon fetch error:", error);
    return null;
  }
}

// SHIPPING API
export async function getShippingRates(packageItems: Array<{ weight: number; dimensions: { length: number; width: number; height: number } }>): Promise<{
  message: {
    couriers: Array<{
      courier_id: string;
      courier_image: string;
      courier_name: string;
      delivery_eta: string;
      total: number;
    }>;
    request_token: string;
  };
} | null> {
  const token = getBearerToken();
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_URL}/shippingRates`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  // body: JSON.stringify({
  //   items: packageItems,
  //   package_items: packageItems,
  // }),
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Shipping rates API error:", errorText);
    throw new Error(`Failed to fetch shipping rates: ${res.status}`);
  }

  return res.json();
}
