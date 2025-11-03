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
