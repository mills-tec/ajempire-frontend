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

export function mapCouponToDeal(coupon: any): Deal {
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
    validUntil: new Date(coupon.expiry).toLocaleDateString(),
    code: coupon.code,
    ctaText: "Get Code",
    status, // ✅ now strictly typed
  };
}
