export interface Promotion {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  promotionType?: string;
  discountType?: string;
  discountValue?: number;
  applyTo?: string;
  applyToId?: string[];
  banner?: string;
  startDate?: string;
  endDate?: string;
  couponCode?: string;
  status?: string;
}

export interface Category {
  _id?: string;
  id?: string;
  name?: string;
}

export interface Product {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
}

export type PromotionType = 'flashsale' | 'coupon';
export type DiscountType = 'percent' | 'fixed';
export type ApplyTo = 'product' | 'category' | 'all';

export interface PromotionFormValues {
  title: string;
  description: string;
  promotionType: PromotionType;
  discountType: DiscountType;
  /** Kept as a raw string so the field can be empty while typing; coerced to a number on submit. */
  discountValue: string;
  applyTo: ApplyTo;
  applyToId: string[];
  /** URL of the already-uploaded banner (edit mode). */
  banner: string;
  startDate: string;
  endDate: string;
  couponCode: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface PromotionStats {
  active: number;
  upcoming: number;
  expired: number;
  /** Sum of active percentage discounts (in %). */
  totalPercentDiscount: number;
  /** Sum of active fixed discounts (in ₦). */
  totalFixedDiscount: number;
}
