import { Review } from "./types";

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

// this is the new price after discount is applied
export function calcDiscountPrice(originalPrice: number, discount: number) {
  // discount is expected as a percentage e.g. 20 for 20%
  if (typeof originalPrice !== "number" || typeof discount !== "number")
    return 0;
  const discountedAmount = (discount / 100) * originalPrice;
  return Math.round(originalPrice - discountedAmount);
}

// this is the removed price after discount is applied
export function calcDiscount(originalPrice: number, discount: number) {
  // discount is expected as a percentage e.g. 20 for 20%
  if (typeof originalPrice !== "number" || typeof discount !== "number")
    return 0;
  const discountedAmount = (discount / 100) * originalPrice;
  return Math.round(discountedAmount);
}

export function getRatingStats(arr: Review[]) {
  type Rating = 1 | 2 | 3 | 4 | 5;
  const counts: Record<Rating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  arr.forEach(({ rating }) => {
    if (rating! >= 1 && rating! <= 5) counts[rating as Rating]++;
  });

  const normalized: Record<Rating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (let r: Rating = 1; r <= 5; r++) {
    normalized[r as Rating] =
      (counts[r as Rating] / Math.max(...Object.values(counts))) * 100; // proportional normalization
  }

  return { counts, normalized };
}



export const saveAccounts = (account: { token: string, user: any, email: string }) => {
  if (localStorage.getItem("savedAccounts")) {
    const savedAccounts: { token: string, user: any, email: string }[] = JSON.parse(localStorage.getItem("savedAccounts")!);
    if (!savedAccounts.some(savedAccount => savedAccount.email == account.email)) {
      localStorage.setItem("savedAccounts", JSON.stringify([...savedAccounts, account]));
    }
  } else {
    localStorage.setItem("savedAccounts", JSON.stringify([account]));

  }
};

export function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
}