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
  weight: number;
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
  weight: number;
  status?: 'active' | 'inactive' | 'draft';
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  images?: string[];
  stock?: number;
  weight?: number;
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
  category?: string;
  linkedProduct?: string;
  likes?: Array<{ id: string; userId: string; createdAt: string }>;
  comments?: Array<{ id: string; userId: string; content: string; createdAt: string }>;
  status?: 'Published' | 'Draft' | 'Archived' | 'Scheduled';
  shares?: number;
  views?: number;
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

// ─── Promotion interfaces ────────────────────────────────────────────────────
// FIX: aligned with what promotions/page.tsx actually sends:
// discountType: 'percent' | 'fixed', discountValue, applyTo, applyToId, couponCode
export interface Promotion {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  promotionType?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  applyTo?: string;
  applyToId?: string[];
  banner?: string;
  couponCode?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePromotionData {
  title: string;
  description: string;
  promotionType?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  applyTo?: string;
  applyToId?: string[];
  banner?: string;
  couponCode?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

// ─── Admin management interfaces ─────────────────────────────────────────────
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

// FIX: permissions is now optional so the form { name, email, role } is valid
export interface CreateAdminData {
  email: string;
  name: string;
  role: string;
  permissions?: string[];
}

// ─── AdminProfile ─────────────────────────────────────────────────────────────
// FIX: added firstName, phoneNumber, profilePicture as optional alongside
// the original name/email/phone/avatar so both the API response shape and
// the local form shape are accepted
export interface AdminProfile {
  name?: string;
  firstName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  avatar?: string;
  profilePicture?: string | null;
}

// ─── AdminSecuritySettings ────────────────────────────────────────────────────
// FIX: sessionTimeout changed from number to string to match the form state
// ('30', '60', etc.), and added loginAlerts & passwordExpiry used by the page
export interface AdminSecuritySettings {
  currentPassword?: string;
  newPassword?: string;
  twoFactorAuth?: boolean;
  twoFactorEnabled?: boolean;
  sessionTimeout?: string;
  passwordExpiry?: string;
  loginAlerts?: boolean;
}

// ─── AdminNotificationSettings ────────────────────────────────────────────────
// FIX: added all six fields the settings page actually uses
export interface AdminNotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderUpdates?: boolean;
  customerMessages?: boolean;
  systemAlerts?: boolean;
  marketingEmails?: boolean;
  orderNotifications?: boolean;
  customerNotifications?: boolean;
  marketingNotifications?: boolean;
}

// ─── Logistics settings ───────────────────────────────────────────────────────
// FIX: removed duplicate declaration and made all heavy fields optional so
// { logisticsMode: 'auto' | 'manual' } is a valid LogisticsSettings value
export interface LogisticsSettings {
  id?: string;
  logisticsMode?: 'auto' | 'manual';
  mode?: 'automatic' | 'manual';
  automaticProvider?: string;
  manualInstructions?: string;
  isActive?: boolean;
  shippingZones?: Array<{
    id: string;
    name: string;
    countries: string[];
    rates: Array<{
      weightMin: number;
      weightMax: number;
      price: number;
    }>;
  }>;
  defaultShippingFee?: number;
  freeShippingThreshold?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateLogisticsData {
  mode?: 'automatic' | 'manual';
  logisticsMode?: 'auto' | 'manual';
  automaticProvider?: string;
  manualInstructions?: string;
  isActive?: boolean;
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
  targetUsers?: string[];
  sendEmail?: boolean;
  sendPush?: boolean;
}