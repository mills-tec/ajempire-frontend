// Generic API response interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Review interfaces
export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Category interfaces
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  image?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  image?: string;
}

// Product interfaces
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  stock: number;
  weight: number; // Weight in kg (required)
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  stock: number;
  weight: number; // Weight in kg (required)
  status?: 'active' | 'inactive' | 'draft';
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  images?: string[];
  stock?: number;
  weight?: number; // Weight in kg (optional for updates)
  status?: 'active' | 'inactive' | 'draft';
}

// Order interfaces
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UpdateOrderData {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
}

// Return interfaces
export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  items: ReturnItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ReturnItem {
  productId: string;
  quantity: number;
  reason: string;
}

export interface UpdateReturnData {
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  refundAmount?: number;
  notes?: string;
}

// Shipping Fee interfaces
export interface ShippingFee {
  id: string;
  location: string;
  fee: number;
  estimatedDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingFeeData {
  location: string;
  fee: number;
  estimatedDays: number;
  isActive?: boolean;
}

export interface UpdateShippingFeeData {
  location?: string;
  fee?: number;
  estimatedDays?: number;
  isActive?: boolean;
}

// Address validation interface
export interface AddressValidation {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Flash Sale interface
export interface FlashSale {
  id: string;
  name: string;
  description: string;
  discountPercentage: number;
  startTime: string;
  endTime: string;
  productIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlashSaleData {
  name: string;
  description: string;
  discountPercentage: number;
  startTime: string;
  endTime: string;
  productIds: string[];
  isActive?: boolean;
}

// Education interface
export interface Education {
  _id: string;
  id?: string;
  title?: string;
  text?: string;
  description?: string;
  content?: string;
  type?: 'video' | 'article' | 'tutorial';
  url?: string;
  thumbnail?: string;
  image?: string;
  video?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Additional fields for content management table
  category?: string;
  linkedProduct?: string;
  likes?: Array<{ id: string; userId: string; createdAt: string }>;  // Array of likes from API
  comments?: Array<{ id: string; userId: string; content: string; createdAt: string }>; // Array of comments from API
  status?: 'Published' | 'Draft' | 'Archived' | 'Scheduled';
  shares?: number;
  views?: number;
  // Fields from actual API response
  user?: { id: string; email: string; name: string; role: string };
  parentId?: string;
}

export interface CreateEducationData {
  title: string;
  description: string;
  image?: string;
  video?: string;
  type?: 'video' | 'article' | 'tutorial';
  url?: string;
  thumbnail?: string;
  isActive?: boolean;
}

// Promotion interfaces
export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts?: string[];
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionData {
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  startDate: string;
  endDate: string;
  applicableProducts?: string[];
  image?: string;
}

// Admin management interfaces
export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminData {
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface AdminProfile {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface AdminSecuritySettings {
  currentPassword?: string;
  newPassword?: string;
  twoFactorEnabled?: boolean;
  sessionTimeout?: number;
}

export interface AdminNotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderNotifications: boolean;
  customerNotifications: boolean;
  marketingNotifications: boolean;
}

// Logistics settings interface
export interface LogisticsSettings {
  shippingZones: Array<{
    id: string;
    name: string;
    countries: string[];
    rates: Array<{
      weightMin: number;
      weightMax: number;
      price: number;
    }>;
  }>;
  defaultShippingFee: number;
  freeShippingThreshold: number;
}

// Customer interface
export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  addresses: Address[];
  totalOrders: number;
  totalSpent: number;
  registeredAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface UpdateCustomerData {
  name?: string;
  phone?: string;
  isActive?: boolean;
}

// Coupon interface
export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponData {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

// Notification interface
export interface SystemNotification {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetUsers?: string[]; // Array of user IDs, if empty sends to all users
  sendEmail?: boolean;
  sendPush?: boolean;
}

// Logistics interface
export interface LogisticsSettings {
  id: string;
  mode: 'automatic' | 'manual';
  automaticProvider?: string; // e.g., 'dhl', 'fedex', 'ups'
  manualInstructions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLogisticsData {
  mode: 'automatic' | 'manual';
  automaticProvider?: string;
  manualInstructions?: string;
  isActive?: boolean;
}
