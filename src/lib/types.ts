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

export interface CombinedVariant {
  _id: string;
  name: string;
  price: number;
  stock: number;
  additionalPrice: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category?: { _id: string; name: string };
  price: number;
  cover_image?: string;
  images?: string[];
  discountedPrice?: number;
  discount?: number; // percentage from API (fallback for discountedPrice)
  itemsSold?: number;
  stock?: number;
  whatsInside?: string[];
  rating?: number;
  numReviews?: number;
  deliveryFee?: number;
  deliveryTime?: number;
  productStatus?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  reviews?: Review[];
  variants?: Variant[];
  variantCombinations?: variantCombinations[];
  flashSales?: {
    startDate: string;
    endDate: string;
    discountValue: number;
    discountType: "percent" | "fixed";
  };
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  averageRating?: number;
  video?: string;
  relatedProducts?: Product[];
}

export interface Review {
  user?: any;
  comment?: string;
  rating?: number;
  image?: string;
  _id?: string;
  createdAt?: string;
  product?: string;
}

export interface Variant {
  name: string;
  values: string[];
}

export interface variantCombinations {
  options: { name: string; value: string }[];
  additionalPrice: number;
  stock: number;
  _id: string;
}

export interface Order {
  items: Product[];
  orderStatus: string;
  order_id: string;
  createdAt: string;
}

export interface IItem {
  product: string;
  name: string;
  variant: { name: string; value: string; _id: string };
  price: number;
  qty: number;
  image: string;
  discountedPrice: number;
  review?: Review;
}

export interface IOrder {
  _id: string;
  items: IItem[];
  orderStatus: string;
  order_id: string;
  createdAt: string;
}

export interface Comment {
  likes: string[];
  text: string;
  user: string;
  parentId: string | null;
  depth?: number;
  replies: Comment[];
  _id: string;
  createdAt: string;
  viewReply?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  image: string;
}

export interface IFeed {
  comments: Comment[];
  likes: string[];
  mediaType: string;
  mediaUrl: string;
  productId: {
    description: string;
    name: string;
    _id: string;
    price: number;
  };
  shares: number;
  _id: string;
}

export interface IReturnRequest {
  _id: string;
  reason: string;
  itemUsed: boolean;
  imageEvidence: string;
  additionalNotes: string;
  phoneNumber: string;

  order: {
    _id: string;
    order_id: string;
  };

  user: string;

  product: Array<{
    _id: string;
    product: string;
    name: string;
    qty: number;
    price: number;
    discountedPrice: number;
    image: string;
    variants: {
      options: any[];
    };
  }>;

  status: "processing" | "approved" | "rejected" | string;
  total: number;

  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  __v: number;
}

export interface CommentData {
  _id: string;
  user: {
    _id: string;
    fullname: string;
    email: string;
  };
  text: string;
  parentId: string | null;
  likes: string[];
  createdAt: string;
  updatedAt: string;
  replies: CommentData[]; // Recursive reference
  showReplies?: boolean;
}

export interface Feed {
  _id: string;
  title: string;
  description: string;
  price?: number;
  product: Product;
  mediaUrl: string;
  mediaType: "image" | "video";
  type: "flashsale" | "education" | "gallery";
  image: string;
  likes?: string[]; // user IDs
  comments?: CommentData[];
  startDate?: string;
  endDate?: string;
  flashPrice?: number;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  type: string;
  data?: {
    product: Product;
    discount: number;
    endTime: string;
  };
  readBy: { userId: string }[];
  hide?: string[];
}
