export interface ProductsResponse {
  message: { products: Product[]; shippingFees: ShippingFeeInfo[] };
}

export interface ProductResponse {
  message: { product: Product; shippingFees: ShippingFeeInfo[] };
}

export interface ShippingFeeInfo {
  deliveryFee: number;
  deliveryTime: number;
  freeShipping: number;
  state: string;
  __v: number;
  _id: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cover_image: string;
  images: string[];
  discountedPrice: number;
  discount?: number; // percentage from API (fallback for discountedPrice)
  itemsSold: number;
  stock: number;
  whatsInside: string[];
  rating: number;
  numReviews: number;
  deliveryFee: number;
  deliveryTime: number;
  productStatus: string;
  isFeatured: boolean;
  isActive: boolean;
  reviews: Review[];
  variants: Variant[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  averageRating?: number; // optional, since one object had it missing
}

export interface Review {
  user: string;
  comment: string;
  rating: number;
  image: string;
  _id: string;
  createdAt: string;
}

export interface Variant {
  name: string;
  price: number;
  stock: number;
  value: string;
  _id: string;
}
