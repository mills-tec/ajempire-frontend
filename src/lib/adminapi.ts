// API Base URL
//AdminAPI
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL + "/api";

import axios, { AxiosResponse } from 'axios';
// Import all types from the types file
import { PromotionPayload } from '@/app/admin/promotions/types';
import {
  AddressValidation,
  Admin,
  AdminNotificationSettings,
  AdminProfile,
  AdminSecuritySettings,
  ApiResponse,
  Banner,
  Category,
  Coupon,
  CreateAdminData,
  CreateCategoryData,
  CreateCouponData, CreateFlashSaleData,
  CreateProductData, CreateShippingFeeData,
  Customer,
  Education,
  FlashSale,
  IReturn,
  LoginCredentials,
  LoginResponse,
  LogisticsPickupAddress,
  LogisticsSettings,
  Product,
  Promotion,
  ReturnRequest,
  Review,
  ShippingFee,
  SystemNotification,
  UpdateCategoryData,
  UpdateCustomerData,
  UpdateOrderData,
  UpdateProductData,
  UpdateReturnData,
  UpdateShippingFeeData
} from './admin-types';
import { IOrder } from './types';

// Helper function for API calls
const apiCall = async <T, M = T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T, M>> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  // Don't set Content-Type for FormData - let browser set it with boundary
  const headers: HeadersInit = {};
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers: {
      ...headers,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    // console.error('API Error:', error);
    //  throw new Error(error || data.message || 'API request failed');
    console.log(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: false
    };
  }
};

// Authentication endpoints
// The backend returns the auth token as a string in `message`
export async function adminLogin(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse, string>> {
  return apiCall('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

// Review endpoints
export const getAllReviews = (): Promise<ApiResponse<Review[]>> =>
  apiCall('/reviews/');

export const deleteReview = (product: string, user: string): Promise<ApiResponse<void>> =>
  apiCall(`/admin/reviews/${product}`, {
    method: 'DELETE',
    body: JSON.stringify({ user })
  });

// Category endpoints
export const getAllCategories = (): Promise<ApiResponse<Category[]>> =>
  apiCall('/category');

export const getCategoryById = (id: string): Promise<ApiResponse<Category>> =>
  apiCall(`/category/${id}`);

export const getImagePresignedUpload = (file: File): Promise<ApiResponse<unknown, { uploadUrl: string; objectKey: string; publicUrl: string; expiresIn: number; }>> =>
  apiCall(`/admin/uploads/image/sign`, { method: "POST", body: JSON.stringify({ fileName: file.name, contentType: file.type }) });

export const getVideoPresignedUpload = (file: File): Promise<ApiResponse<unknown, { videoId: string; libraryId: string; expirationTime: string; signature: string; }>> =>
  apiCall(`/admin/uploads/video/sign`, { method: "POST", body: JSON.stringify({ fileName: file.name, contentType: file.type }) });

export const uploadFile = (file: File, url: string): Promise<AxiosResponse<unknown>> =>
  axios.put(url, file, {
    headers: { "Content-Type": file.type },
  });

export const createCategory = (data: CreateCategoryData): Promise<ApiResponse<Category>> => {
  // Check if data is FormData (for file uploads) or regular JSON data
  if (data instanceof FormData) {
    return apiCall('/admin/category', {
      method: 'POST',
      body: data,
      // headers: {}, // Let browser set Content-Type for FormData
    });
  } else {
    return apiCall('/admin/category', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

export const updateCategory = (id: string, data: UpdateCategoryData): Promise<ApiResponse<Category>> =>
  apiCall(`/admin/category/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const updateCategoryWithFiles = (id: string, data: FormData): Promise<ApiResponse<Category>> =>
  apiCall(`/admin/category/${id}`, {
    method: 'PATCH',
    body: data,
  });

export const deleteCategory = (id: string): Promise<ApiResponse<void>> =>
  apiCall(`/admin/category/${id}`, {
    method: 'DELETE',
  });

// Product endpoints
export const getProducts = (cursor?: string): Promise<ApiResponse<Product[]>> =>
  apiCall(cursor ? `/product?cursor=${cursor}` : '/product');

export const getProductById = (id: string): Promise<ApiResponse<Product>> =>
  apiCall(`/admin/product/${id}`);

export const createProduct = (data: CreateProductData): Promise<ApiResponse<Product>> =>
  apiCall('/admin/product', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateProduct = (id: string, data: UpdateProductData): Promise<ApiResponse<Product>> =>
  apiCall(`/admin/product/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteProduct = (id: string): Promise<ApiResponse<void>> =>
  apiCall(`/admin/product/${id}`, {
    method: 'DELETE',
  });

// Order endpoints
export const getUserOrders = (): Promise<ApiResponse<IOrder[]>> =>
  apiCall('/admin/order');

export const getOrderById = (id: string): Promise<ApiResponse<IOrder>> =>
  apiCall(`/admin/order/${id}`);

export const updateOrder = (id: string, data: UpdateOrderData): Promise<ApiResponse<IOrder>> =>
  apiCall(`/admin/order/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteOrder = (id: string): Promise<ApiResponse<void>> =>
  apiCall(`/admin/order/${id}`, {
    method: 'DELETE',
  });

// Return endpoints
export const getAllReturns = (): Promise<ApiResponse<IReturn[]>> =>
  apiCall('/admin/return/');

export const getReturnById = (id: string): Promise<ApiResponse<IReturn>> =>
  apiCall(`/admin/return/${id}`);

export const updateReturn = (id: string, data: UpdateReturnData): Promise<ApiResponse<IReturn>> => {
  console.log(data);
  return apiCall(`/admin/return/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Shipping Fee endpoints
export const getShippingFees = (): Promise<ApiResponse<ShippingFee[]>> =>
  apiCall('/admin/shippingFees');

export const getShippingFeeById = (id: string): Promise<ApiResponse<ShippingFee>> =>
  apiCall(`/admin/shippingFees/${id}`);

export const createShippingFee = (data: CreateShippingFeeData): Promise<ApiResponse<ShippingFee>> =>
  apiCall('/admin/shippingFees', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateShippingFee = (id: string, data: UpdateShippingFeeData): Promise<ApiResponse<ShippingFee>> =>
  apiCall(`/admin/shippingFees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteShippingFee = (id: string): Promise<ApiResponse<void>> =>
  apiCall(`/admin/shippingFees/${id}`, {
    method: 'DELETE',
  });

// Address validation endpoint
export const validatePickupAddress = (address: AddressValidation): Promise<ApiResponse<{ isValid: boolean; message?: string }>> =>
  apiCall('/admin/validateSenderAddress', {
    method: 'POST',
    body: JSON.stringify(address),
  });

// Flash Sale endpoints
export const createFlashSale = (data: CreateFlashSaleData): Promise<ApiResponse<FlashSale>> =>
  apiCall('/admin/flashsales', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Promotion endpoints
export interface PromotionQueryParams {
  page?: number;
  limit?: number;
}

export const getPromotions = (params?: PromotionQueryParams): Promise<ApiResponse<Promotion[]>> => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const queryString = query.toString();
  return apiCall(queryString ? `/admin/promotions?${queryString}` : '/admin/promotions');
};

export const createPromotion = (data: PromotionPayload): Promise<ApiResponse<Promotion>> => {
  if (data instanceof FormData) {
    return apiCall('/admin/promotions', {
      method: 'POST',
      body: data,
    });
  }
  return apiCall('/admin/promotions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updatePromotion = (id: string, data: PromotionPayload): Promise<ApiResponse<Promotion>> => {
  if (data instanceof FormData) {
    return apiCall(`/admin/promotions/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }
  return apiCall(`/admin/promotions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deletePromotion = (id: string): Promise<ApiResponse<void>> =>
  apiCall(`/admin/promotions/${id}`, {
    method: 'DELETE',
  });

// Education endpoints
export const getEducation = (): Promise<ApiResponse<Education[]>> =>
  apiCall('/admin/education');

export const deleteEducation = (id: string): Promise<ApiResponse<void>> =>
  apiCall(`/admin/education/${id}`, {
    method: 'DELETE',
  });

export const updateEducation = (id: string, data: {
  title?: string;
  description?: string;
  image?: string;
  video?: string;
}): Promise<ApiResponse<Education>> =>
  apiCall(`/admin/education/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const createEducation = (data: {
  title: string;
  description: string;
  image?: string;
}): Promise<ApiResponse<Education>> =>
  apiCall('/admin/education', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const createEducationWithFiles = (formData: FormData): Promise<ApiResponse<Education>> =>
  apiCall('/admin/education', {
    method: 'POST',
    body: formData,
  });



// Coupon endpoints
export const createCoupon = (data: CreateCouponData): Promise<ApiResponse<Coupon>> =>
  apiCall('/admin/coupon', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Notification endpoint
export const sendUserNotification = (notification: SystemNotification): Promise<ApiResponse<void>> =>
  apiCall('/admin/systemUpdate', {
    method: 'POST',
    body: JSON.stringify(notification),
  });

// Settings endpoints
export const addAdmin = (data: CreateAdminData): Promise<ApiResponse<Admin>> =>
  apiCall('/admin/settings/roleandaccess', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateAdminPermission = (id: string, data: CreateAdminData): Promise<ApiResponse<Admin>> =>
  apiCall(`/admin/settings/roleandaccess/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const getAllAdmins = (): Promise<ApiResponse<Admin[]>> =>
  apiCall('/admin/settings/roleandaccess');

export const fetchPermissions = (): Promise<ApiResponse<{ id: string; name: string; description: string }[]>> =>
  apiCall('/admin/permissions');

export const fetchDefaultPermissions = (role: string): Promise<ApiResponse<string[]>> =>
  apiCall(`/admin/default-permission/${role}`);

export const deleteAdmin = (id: string): Promise<ApiResponse<void>> =>
  apiCall(`/admin/settings/roleandaccess/${id}`, {
    method: 'DELETE',
  });

export const fetchAdminProfile = (): Promise<ApiResponse<AdminProfile>> =>
  apiCall('/admin/settings/profile');

export const getReturns = (): Promise<ApiResponse<ReturnRequest[]>> =>
  apiCall('/admin/return');

// PUSH NOTIFICATION

export const updateAdminPushNotification = (token: string): Promise<ApiResponse<{
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any;
}>> => apiCall('/admin/notification/savePushToken', {
  method: 'POST',
  body: JSON.stringify({ token }),
});

export const updateAdminProfile = (data: {name: string}): Promise<ApiResponse<AdminProfile>> =>
  apiCall('/admin/settings/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const updateAdminSecuritySettings = (data: AdminSecuritySettings): Promise<ApiResponse<AdminSecuritySettings>> =>
  apiCall('/admin/settings/security', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const setupAdminPassword = (data: { token: string, password: string }): Promise<ApiResponse<AdminSecuritySettings, string>> => apiCall("/admin/setupPassword", {
  method: "POST",
  body: JSON.stringify(data)
})
export const updateAdminNotificationSettings = (data: AdminNotificationSettings): Promise<ApiResponse<AdminNotificationSettings>> =>
  apiCall('/admin/settings/notifications', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// Logistics endpoints
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getLogisticsSettings = (): Promise<ApiResponse<any>> =>
  apiCall('/logisticsStatus');

export const updateLogisticsSettings = (data: LogisticsSettings): Promise<ApiResponse<LogisticsSettings>> =>
  apiCall('/admin/logistics', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const updateLogisticsShippingAddress = (data: LogisticsPickupAddress): Promise<ApiResponse<LogisticsPickupAddress>> =>
  apiCall('/admin/validatePickupAddress', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const getWalletBalance = (): Promise<ApiResponse<{ currency: string; balance: number }>> => apiCall('/admin/wallet');
export const fundWallet = (data: { amount: number }): Promise<ApiResponse<void, { data?: { payment_url?: string } }>> => apiCall('/admin/wallet', {
  method: 'POST',
  body: JSON.stringify(data),
});


// Customer Management APIs
export const getCustomers = (): Promise<ApiResponse<Customer[]>> =>
  apiCall('/admin/customers');

export const getCustomerById = (id: string): Promise<ApiResponse<Customer>> =>
  apiCall(`/admin/customers/${id}`);

export const updateCustomer = (id: string, data: UpdateCustomerData): Promise<ApiResponse<Customer>> =>
  apiCall(`/admin/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteCustomer = (id: string): Promise<ApiResponse<void>> =>
  apiCall(`/admin/customers/${id}`, {
    method: 'DELETE',
  });

export const getCustomerOrders = (id: string): Promise<ApiResponse<IOrder[]>> =>
  apiCall(`/admin/customers/${id}/orders`);

export const updateCustomerStatus = (id: string, status: string): Promise<ApiResponse<Customer>> =>
  apiCall(`/admin/customers/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toggleCustomerStatus = (id: string): Promise<ApiResponse<any>> =>
  apiCall(`/admin/customer/toggleStatus/${id}`, {
    method: 'PATCH',
  });

// Banner endpoints
export const getBanners = (): Promise<ApiResponse<Banner[]>> =>
  apiCall('/admin/banner');

export const createBanner = (images: {
  url: string;
  link?: string;
}[]): Promise<ApiResponse<Banner>> =>
  apiCall('/admin/banner', {
    method: 'POST',
    body: JSON.stringify({ images }),
  });

export const updateBanner = (id: string, data: FormData): Promise<ApiResponse<Banner>> =>
  apiCall(`/admin/banner/${id}`, {
    method: 'PATCH',
    body: data,
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeImageFromBanner = (id: string, url: string): Promise<ApiResponse<any>> =>
  apiCall(`/admin/banner/${id}/images`, {
    method: 'DELETE',
    body: JSON.stringify({ url }),
  });

export const deleteBanner = (id: string): Promise<ApiResponse<void>> =>
  apiCall(`/admin/banner/${id}`, {
    method: 'DELETE',
  });


// Export all interfaces for use in components (re-export from types file)
export type {
  Address, AddressValidation, ApiResponse, Banner,
  BannerImage, Category, Coupon, CreateCategoryData, CreateCouponData, CreateEducationData, CreateFlashSaleData, CreateProductData, CreateShippingFeeData, Education, FlashSale, LoginCredentials,
  LoginResponse, LogisticsSettings, Order,
  OrderItem, Product, ReturnItem, ReturnRequest, Review, ShippingFee, SystemNotification, UpdateCategoryData, UpdateLogisticsData, UpdateOrderData, UpdateProductData, UpdateReturnData, UpdateShippingFeeData
} from './admin-types';

