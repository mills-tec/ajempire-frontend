export interface ProductResponse {
  message: Product[];
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
  // Define fields if known later
}
