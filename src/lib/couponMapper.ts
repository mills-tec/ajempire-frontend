export type Deal = {
  id: string | number;
  title: string;
  description?: string;
  discountPercent: number;
  validUntil?: string;
  code: string;
  ctaText?: string;
  status: "unused" | "used" | "expired";
};

export function mapCouponToDeal(coupon: { 
  _id: string | number; 
  title: string; 
  description?: string; 
  discountPercent: number; 
  validUntil?: string; 
  code: string; 
  ctaText?: string; 
  isExpired: boolean; 
  discountType: 'percent' | 'fixed';
  discountValue: number;
  expiry?: string;
}): Deal {
  const status: Deal["status"] = coupon.isExpired ? "expired" : "unused";

  return {
    id: coupon._id,
    title: coupon.title,
    description:
      coupon.discountType === "percent"
        ? `${coupon.discountValue}% off`
        : `₦${coupon.discountValue.toLocaleString()} off`,
    discountPercent:
      coupon.discountType === "percent" ? coupon.discountValue : 0,
    validUntil: coupon.expiry ? new Date(coupon.expiry).toLocaleDateString() : undefined,
    code: coupon.code,
    ctaText: "Get Code",
    status, // ✅ now strictly typed
  };
}
