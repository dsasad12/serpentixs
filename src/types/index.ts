// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'admin' | 'staff' | 'client';
  balance: number;
  createdAt: Date;
  lastLogin?: Date;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
}

// Product Types
export type ProductCategory = 
  | 'game-hosting'
  | 'web-hosting'
  | 'vps'
  | 'dedicated'
  | 'domains';

export interface ProductFeature {
  name: string;
  value: string;
  included: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: ProductCategory;
  image?: string;
  icon?: string;
  features: ProductFeature[];
  popular: boolean;
  available: boolean;
}

export interface PricingPlan {
  id: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
  setupFee: number;
  features: ProductFeature[];
  specs: Record<string, string>;
  popular: boolean;
  available: boolean;
}

// Service Types
export type ServiceStatus = 
  | 'active'
  | 'pending'
  | 'suspended'
  | 'cancelled'
  | 'terminated';

export interface Service {
  id: string;
  userId: string;
  productId: string;
  planId: string;
  name: string;
  status: ServiceStatus;
  domain?: string;
  ipAddress?: string;
  username?: string;
  createdAt: Date;
  nextDueDate: Date;
  price: number;
  billingCycle: string;
}

// Invoice Types
export type InvoiceStatus = 
  | 'draft'
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'refunded';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  notes?: string;
}

// Ticket Types
export type TicketStatus = 'open' | 'answered' | 'customer-reply' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketDepartment = 'sales' | 'support' | 'billing' | 'abuse';

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'client';
  message: string;
  attachments?: string[];
  createdAt: Date;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  userId: string;
  subject: string;
  department: TicketDepartment;
  priority: TicketPriority;
  status: TicketStatus;
  serviceId?: string;
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

// Transaction Types
export type TransactionType = 'payment' | 'refund' | 'credit' | 'debit';

export interface Transaction {
  id: string;
  userId: string;
  invoiceId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  gateway: string;
  gatewayTransactionId?: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: Date;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  planId: string;
  productName: string;
  planName: string;
  price: number;
  billingCycle: string;
  quantity: number;
  configOptions?: Record<string, string>;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  couponCode?: string;
  discount: number;
}

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

// Stats Types
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  activeServices: number;
  servicesChange: number;
  pendingInvoices: number;
  invoicesChange: number;
  openTickets: number;
  ticketsChange: number;
}

export interface AdminStats extends DashboardStats {
  totalClients: number;
  clientsChange: number;
  totalOrders: number;
  ordersChange: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
