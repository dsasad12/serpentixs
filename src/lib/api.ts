import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Configuración base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Función para obtener el token (se inyecta después para evitar importación circular)
let getAuthToken: () => string | null = () => null;
let getRefreshToken: () => string | null = () => null;
let setTokens: (access: string, refresh: string) => void = () => {};
let logoutUser: () => void = () => {};

export const setAuthFunctions = (fns: {
  getToken: () => string | null;
  getRefresh: () => string | null;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
}) => {
  getAuthToken = fns.getToken;
  getRefreshToken = fns.getRefresh;
  setTokens = fns.setTokens;
  logoutUser = fns.logout;
};

// Crear instancia de axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor de request - añadir token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response - manejar errores y refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si es error 401 y no es un retry, intentar refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          setTokens(accessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, cerrar sesión
        logoutUser();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Tipos de respuesta
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ AUTH API ============

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  avatar?: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  me: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  setup2FA: async (): Promise<ApiResponse<{ secret: string; qrCode: string }>> => {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
  },

  enable2FA: async (code: string): Promise<ApiResponse<{ backupCodes: string[] }>> => {
    const response = await api.post('/auth/2fa/enable', { code });
    return response.data;
  },

  disable2FA: async (code: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/2fa/disable', { code });
    return response.data;
  },
};

// ============ USER API ============

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export const userApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/user/change-password', { currentPassword, newPassword });
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ============ PRODUCTS API ============

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  categoryId: string;
  category: Category;
  pricing: ProductPricing[];
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  stockQuantity: number | null;
}

export interface ProductPricing {
  id: string;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY' | 'BIENNIALLY' | 'TRIENNIALLY' | 'ONE_TIME';
  price: number;
  setupFee: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
}

export const productsApi = {
  getAll: async (params?: {
    category?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/products/categories');
    return response.data;
  },
};

// ============ SERVICES API ============

export interface Service {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  domain?: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'CANCELLED';
  billingCycle: string;
  price: number;
  nextDueDate: string;
  createdAt: string;
  externalId?: string;
}

export const servicesApi = {
  getAll: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Service>> => {
    const response = await api.get('/services', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Service>> => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  performAction: async (id: string, action: 'start' | 'stop' | 'restart' | 'reinstall'): Promise<ApiResponse<null>> => {
    const response = await api.post(`/services/${id}/action`, { action });
    return response.data;
  },

  getStats: async (id: string): Promise<ApiResponse<{ cpu: number; memory: number; disk: number }>> => {
    const response = await api.get(`/services/${id}/stats`);
    return response.data;
  },
};

// ============ INVOICES API ============

export interface Invoice {
  id: string;
  number: string;
  userId: string;
  status: 'DRAFT' | 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  paidAt?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export const invoicesApi = {
  getAll: async (params?: {
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Invoice>> => {
    const response = await api.get('/invoices', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Invoice>> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  downloadPdf: async (id: string): Promise<Blob> => {
    const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },

  pay: async (id: string, gateway: string, returnUrl?: string): Promise<ApiResponse<{ paymentUrl: string }>> => {
    const response = await api.post(`/invoices/${id}/pay`, { gateway, returnUrl });
    return response.data;
  },
};

// ============ ORDERS API ============

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  billingCycle: string;
  domain?: string;
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    pricingId: string;
    quantity: number;
    domain?: string;
    options?: Record<string, unknown>;
  }[];
  couponCode?: string;
}

export const ordersApi = {
  getAll: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (data: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  getCart: async (): Promise<ApiResponse<Order | null>> => {
    const response = await api.get('/orders/cart');
    return response.data;
  },

  checkout: async (orderId: string, paymentGateway: string): Promise<ApiResponse<{ paymentUrl: string }>> => {
    const response = await api.post('/orders/checkout', { orderId, paymentGateway });
    return response.data;
  },

  applyCoupon: async (orderId: string, couponCode: string): Promise<ApiResponse<Order>> => {
    const response = await api.post(`/orders/${orderId}/coupon`, { couponCode });
    return response.data;
  },
};

// ============ TICKETS API ============

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  status: 'OPEN' | 'ANSWERED' | 'CUSTOMER_REPLY' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  department: string;
  serviceId?: string;
  replies: TicketReply[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketReply {
  id: string;
  userId: string;
  user: {
    name: string;
    role: string;
  };
  message: string;
  attachments: string[];
  createdAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  department: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  message: string;
  serviceId?: string;
}

export const ticketsApi = {
  getAll: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Ticket>> => {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Ticket>> => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  create: async (data: CreateTicketRequest): Promise<ApiResponse<Ticket>> => {
    const response = await api.post('/tickets', data);
    return response.data;
  },

  reply: async (id: string, message: string, attachments?: File[]): Promise<ApiResponse<TicketReply>> => {
    const formData = new FormData();
    formData.append('message', message);
    if (attachments) {
      attachments.forEach((file) => formData.append('attachments', file));
    }
    const response = await api.post(`/tickets/${id}/reply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  close: async (id: string): Promise<ApiResponse<Ticket>> => {
    const response = await api.post(`/tickets/${id}/close`);
    return response.data;
  },

  reopen: async (id: string): Promise<ApiResponse<Ticket>> => {
    const response = await api.post(`/tickets/${id}/reopen`);
    return response.data;
  },
};

// ============ SETTINGS API ============

export interface PublicSettings {
  appName: string;
  appLogo?: string;
  appFavicon?: string;
  currency: string;
  currencySymbol: string;
  supportEmail: string;
  maintenanceMode: boolean;
  socialLinks?: {
    discord?: string;
    twitter?: string;
    facebook?: string;
  };
}

export const settingsApi = {
  getPublic: async (): Promise<ApiResponse<PublicSettings>> => {
    const response = await api.get('/settings/public');
    return response.data;
  },

  getPaymentGateways: async (): Promise<ApiResponse<{ id: string; name: string; enabled: boolean }[]>> => {
    const response = await api.get('/settings/payment-gateways');
    return response.data;
  },
};

// ============ ADMIN API ============

export interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeServices: number;
  totalUsers: number;
  pendingTickets: number;
  pendingInvoices: number;
  recentOrders: Order[];
  revenueChart: { date: string; revenue: number }[];
}

export const adminApi = {
  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Users
  getUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (data: RegisterRequest & { role?: string }): Promise<ApiResponse<User>> => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Products
  getProducts: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  createProduct: async (data: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.post('/admin/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.put(`/admin/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  // Categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  createCategory: async (data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Settings
  getSettings: async (): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (data: Record<string, unknown>): Promise<ApiResponse<null>> => {
    const response = await api.put('/admin/settings', data);
    return response.data;
  },

  // Invoices
  getInvoices: async (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Invoice>> => {
    const response = await api.get('/admin/invoices', { params });
    return response.data;
  },

  // Tickets
  getTickets: async (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Ticket>> => {
    const response = await api.get('/admin/tickets', { params });
    return response.data;
  },

  assignTicket: async (id: string, staffId: string): Promise<ApiResponse<Ticket>> => {
    const response = await api.post(`/admin/tickets/${id}/assign`, { staffId });
    return response.data;
  },
};

export default api;
