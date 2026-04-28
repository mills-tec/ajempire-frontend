// API Base URL
const API_BASE_URL = "https://ajempire-backend-production.up.railway.app/api";

// Import all types from the types file
import {
  ApiResponse,
  LoginCredentials,
  LoginResponse,
  Review,
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  Product,
  CreateProductData,
  UpdateProductData,
  Order,
  OrderItem,
  Address,
  UpdateOrderData,
  ReturnRequest,
  ReturnItem,
  UpdateReturnData,
  ShippingFee,
  CreateShippingFeeData,
  UpdateShippingFeeData,
  AddressValidation,
  FlashSale,
  CreateFlashSaleData,
  Education,
  CreateEducationData,
  Coupon,
  CreateCouponData,
  SystemNotification,
} from './admin-types';

// Helper function for API calls
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
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
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Authentication endpoints
export async function adminLogin(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
  return apiCall('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

// Review endpoints
export const getAllReviews = (): Promise<ApiResponse<Review[]>> =>
  apiCall('/review/');

export const deleteReview = (id: string): Promise<ApiResponse<void>> =>
  apiCall(`/admin/review/${id}`, {
    method: 'DELETE',
  });

// Category endpoints
export const getAllCategories = (): Promise<ApiResponse<Category[]>> =>
  apiCall('/category');

export const getCategoryById = (id: string): Promise<ApiResponse<Category>> =>
  apiCall(`/category/${id}`);

export const createCategory = (data: CreateCategoryData | FormData): Promise<ApiResponse<Category>> => {
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
    method: 'PUT',
    body: JSON.stringify(data),
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

export const createProduct = (data: CreateProductData | FormData): Promise<ApiResponse<Product>> => {
  // Check if data is FormData (for file uploads) or regular JSON data
  if (data instanceof FormData) {
    return apiCall('/admin/product', {
      method: 'POST',
      body: data,
      // headers: {}, // Let browser set Content-Type for FormData
    });
  } else {
    return apiCall('/admin/product', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

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
export const getUserOrders = (): Promise<ApiResponse<Order[]>> =>
  apiCall('/admin/order');

export const getOrderById = (id: string): Promise<ApiResponse<Order>> =>
  apiCall(`/admin/order/${id}`);

export const updateOrder = (id: string, data: UpdateOrderData): Promise<ApiResponse<Order>> =>
  apiCall(`/admin/order/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteOrder = (id: string): Promise<ApiResponse<void>> =>
  apiCall(`/admin/order/${id}`, {
    method: 'DELETE',
  });

// Return endpoints
export const getAllReturns = (): Promise<ApiResponse<ReturnRequest[]>> =>
  apiCall('/return/');

export const getReturnById = (id: string): Promise<ApiResponse<ReturnRequest>> =>
  apiCall(`/return/${id}`);

export const updateReturn = (id: string, data: UpdateReturnData): Promise<ApiResponse<ReturnRequest>> =>
  apiCall(`/return/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

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
    method: 'PUT',
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
export const getPromotions = (): Promise<ApiResponse<any[]>> =>
  apiCall('/admin/promotions');

export const createPromotion = (data: any): Promise<ApiResponse<any>> =>
  apiCall('/admin/promotions', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updatePromotion = (id: string, data: any): Promise<ApiResponse<any>> =>
  apiCall(`/admin/promotions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

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

export const updateEducation = (id: string, data: FormData): Promise<ApiResponse<Education>> =>
  apiCall(`/admin/education/${id}`, {
    method: 'PUT',
    body: data,
  });

export const createEducation = (data: CreateEducationData): Promise<ApiResponse<Education>> =>
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
export const addAdmin = (data: any): Promise<ApiResponse<any>> =>
  apiCall('/admin/settings/roleandaccess', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateAdminPermission = (id: string, data: any): Promise<ApiResponse<any>> =>
  apiCall(`/admin/settings/roleandaccess/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const getAllAdmins = (): Promise<ApiResponse<any[]>> =>
  apiCall('/admin/settings/roleandaccess');

export const fetchPermissions = (): Promise<ApiResponse<any[]>> =>
  apiCall('/admin/settings/permissions');

export const deleteAdmin = (id: string): Promise<ApiResponse<void>> =>
  apiCall(`/admin/settings/roleandaccess/${id}`, {
    method: 'DELETE',
  });

export const fetchAdminProfile = (): Promise<ApiResponse<any>> =>
  apiCall('/admin/settings/profile');

export const getReturns = (): Promise<ApiResponse<any[]>> =>
  apiCall('/admin/returns');

export const updateAdminProfile = (data: any): Promise<ApiResponse<any>> =>
  apiCall('/admin/settings/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const updateAdminSecuritySettings = (data: any): Promise<ApiResponse<any>> =>
  apiCall('/admin/settings/security', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const updateAdminNotificationSettings = (data: any): Promise<ApiResponse<any>> =>
  apiCall('/admin/settings/notifications', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// Logistics endpoints
export const getLogisticsSettings = (): Promise<ApiResponse<any>> =>
  apiCall('/admin/logistics');

export const updateLogisticsSettings = (data: any): Promise<ApiResponse<any>> =>
  apiCall('/admin/logistics', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// Customer Management APIs
export const getCustomers = (): Promise<ApiResponse<any[]>> =>
  apiCall('/admin/customers');

export const getCustomerById = (id: string): Promise<ApiResponse<any>> =>
  apiCall(`/admin/customers/${id}`);

export const updateCustomer = (id: string, data: any): Promise<ApiResponse<any>> =>
  apiCall(`/admin/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteCustomer = (id: string): Promise<ApiResponse<any>> =>
  apiCall(`/admin/customers/${id}`, {
    method: 'DELETE',
  });

export const getCustomerOrders = (id: string): Promise<ApiResponse<any[]>> =>
  apiCall(`/admin/customers/${id}/orders`);

export const updateCustomerStatus = (id: string, status: string): Promise<ApiResponse<any>> =>
  apiCall(`/admin/customers/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

// Export all interfaces for use in components (re-export from types file)
export type {
  ApiResponse,
  LoginCredentials,
  LoginResponse,
  Review,
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  Product,
  CreateProductData,
  UpdateProductData,
  Order,
  OrderItem,
  Address,
  UpdateOrderData,
  ReturnRequest,
  ReturnItem,
  UpdateReturnData,
  ShippingFee,
  CreateShippingFeeData,
  UpdateShippingFeeData,
  AddressValidation,
  FlashSale,
  CreateFlashSaleData,
  Education,
  CreateEducationData,
  Coupon,
  CreateCouponData,
  SystemNotification,
  LogisticsSettings,
  UpdateLogisticsData,
} from './admin-types';