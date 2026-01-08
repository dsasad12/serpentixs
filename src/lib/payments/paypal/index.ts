/**
 * PayPal Integration
 * Complete PayPal payment gateway integration
 */

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  sandbox?: boolean;
  webhookId?: string;
  brandName?: string;
}

export interface PayPalAccessToken {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
}

export interface PayPalOrder {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: {
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
      breakdown?: {
        item_total?: { currency_code: string; value: string };
        shipping?: { currency_code: string; value: string };
        tax_total?: { currency_code: string; value: string };
        discount?: { currency_code: string; value: string };
      };
    };
    description?: string;
    custom_id?: string;
    invoice_id?: string;
    items?: {
      name: string;
      unit_amount: { currency_code: string; value: string };
      quantity: string;
      description?: string;
      sku?: string;
      category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS' | 'DONATION';
    }[];
    shipping?: {
      name?: { full_name: string };
      address?: {
        address_line_1: string;
        address_line_2?: string;
        admin_area_2: string;
        admin_area_1: string;
        postal_code: string;
        country_code: string;
      };
    };
    payments?: {
      captures?: PayPalCapture[];
      authorizations?: PayPalAuthorization[];
    };
  }[];
  payer?: {
    name?: { given_name: string; surname: string };
    email_address?: string;
    payer_id?: string;
    phone?: { phone_type: string; phone_number: { national_number: string } };
    address?: {
      address_line_1?: string;
      admin_area_2?: string;
      admin_area_1?: string;
      postal_code?: string;
      country_code: string;
    };
  };
  create_time: string;
  update_time: string;
  links: { href: string; rel: string; method: string }[];
}

export interface PayPalCapture {
  id: string;
  status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  amount: { currency_code: string; value: string };
  final_capture: boolean;
  seller_protection?: {
    status: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
    dispute_categories: string[];
  };
  create_time: string;
  update_time: string;
}

export interface PayPalAuthorization {
  id: string;
  status: 'CREATED' | 'CAPTURED' | 'DENIED' | 'EXPIRED' | 'PARTIALLY_CAPTURED' | 'VOIDED' | 'PENDING';
  amount: { currency_code: string; value: string };
  create_time: string;
  update_time: string;
  expiration_time: string;
}

export interface PayPalSubscription {
  id: string;
  plan_id: string;
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  status_update_time: string;
  start_time: string;
  quantity: string;
  shipping_amount?: { currency_code: string; value: string };
  subscriber?: {
    name?: { given_name: string; surname: string };
    email_address?: string;
    payer_id?: string;
    shipping_address?: {
      name?: { full_name: string };
      address?: {
        address_line_1: string;
        admin_area_2: string;
        admin_area_1: string;
        postal_code: string;
        country_code: string;
      };
    };
  };
  billing_info?: {
    outstanding_balance: { currency_code: string; value: string };
    cycle_executions: {
      tenure_type: string;
      sequence: number;
      cycles_completed: number;
      cycles_remaining: number;
      total_cycles: number;
    }[];
    last_payment?: {
      amount: { currency_code: string; value: string };
      time: string;
    };
    next_billing_time?: string;
    failed_payments_count: number;
  };
  create_time: string;
  update_time: string;
  links: { href: string; rel: string; method: string }[];
}

export interface PayPalPlan {
  id: string;
  product_id: string;
  name: string;
  status: 'CREATED' | 'INACTIVE' | 'ACTIVE';
  description?: string;
  billing_cycles: {
    frequency: { interval_unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'; interval_count: number };
    tenure_type: 'REGULAR' | 'TRIAL';
    sequence: number;
    total_cycles: number;
    pricing_scheme: {
      fixed_price: { currency_code: string; value: string };
    };
  }[];
  payment_preferences: {
    auto_bill_outstanding: boolean;
    setup_fee?: { currency_code: string; value: string };
    setup_fee_failure_action: 'CONTINUE' | 'CANCEL';
    payment_failure_threshold: number;
  };
  taxes?: { percentage: string; inclusive: boolean };
  create_time: string;
  update_time: string;
}

export interface CreateOrderParams {
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: {
    reference_id?: string;
    amount: {
      currency_code: string;
      value: string;
      breakdown?: {
        item_total?: { currency_code: string; value: string };
        shipping?: { currency_code: string; value: string };
        tax_total?: { currency_code: string; value: string };
        discount?: { currency_code: string; value: string };
      };
    };
    description?: string;
    custom_id?: string;
    invoice_id?: string;
    items?: {
      name: string;
      unit_amount: { currency_code: string; value: string };
      quantity: string;
      description?: string;
      sku?: string;
      category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS' | 'DONATION';
    }[];
  }[];
  application_context?: {
    brand_name?: string;
    locale?: string;
    landing_page?: 'LOGIN' | 'BILLING' | 'NO_PREFERENCE';
    shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
    user_action?: 'CONTINUE' | 'PAY_NOW';
    return_url?: string;
    cancel_url?: string;
  };
}

class PayPalAPI {
  private config: PayPalConfig;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: PayPalConfig) {
    this.config = config;
    this.baseUrl = config.sandbox 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const credentials = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
    
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`PayPal Auth Error: ${response.status}`);
    }

    const data: PayPalAccessToken = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer
    
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<T> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': this.generateRequestId(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `PayPal API Error: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============ ORDERS ============

  async createOrder(params: CreateOrderParams): Promise<PayPalOrder> {
    // Add brand name from config if not provided
    if (!params.application_context?.brand_name && this.config.brandName) {
      params.application_context = {
        ...params.application_context,
        brand_name: this.config.brandName,
      };
    }

    return this.request('/v2/checkout/orders', 'POST', params);
  }

  async getOrder(orderId: string): Promise<PayPalOrder> {
    return this.request(`/v2/checkout/orders/${orderId}`);
  }

  async captureOrder(orderId: string): Promise<PayPalOrder> {
    return this.request(`/v2/checkout/orders/${orderId}/capture`, 'POST');
  }

  async authorizeOrder(orderId: string): Promise<PayPalOrder> {
    return this.request(`/v2/checkout/orders/${orderId}/authorize`, 'POST');
  }

  // ============ CAPTURES ============

  async getCapture(captureId: string): Promise<PayPalCapture> {
    return this.request(`/v2/payments/captures/${captureId}`);
  }

  async refundCapture(captureId: string, params?: {
    amount?: { currency_code: string; value: string };
    invoice_id?: string;
    note_to_payer?: string;
  }): Promise<{ id: string; status: string; amount: { currency_code: string; value: string } }> {
    return this.request(`/v2/payments/captures/${captureId}/refund`, 'POST', params || {});
  }

  // ============ AUTHORIZATIONS ============

  async getAuthorization(authorizationId: string): Promise<PayPalAuthorization> {
    return this.request(`/v2/payments/authorizations/${authorizationId}`);
  }

  async captureAuthorization(authorizationId: string, params?: {
    amount?: { currency_code: string; value: string };
    invoice_id?: string;
    final_capture?: boolean;
  }): Promise<PayPalCapture> {
    return this.request(`/v2/payments/authorizations/${authorizationId}/capture`, 'POST', params || {});
  }

  async voidAuthorization(authorizationId: string): Promise<void> {
    return this.request(`/v2/payments/authorizations/${authorizationId}/void`, 'POST');
  }

  // ============ SUBSCRIPTIONS ============

  async createProduct(params: {
    name: string;
    description?: string;
    type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
    category?: string;
    image_url?: string;
    home_url?: string;
  }): Promise<{ id: string; name: string; create_time: string }> {
    return this.request('/v1/catalogs/products', 'POST', params);
  }

  async createPlan(params: {
    product_id: string;
    name: string;
    description?: string;
    billing_cycles: {
      frequency: { interval_unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'; interval_count: number };
      tenure_type: 'REGULAR' | 'TRIAL';
      sequence: number;
      total_cycles: number;
      pricing_scheme: {
        fixed_price: { currency_code: string; value: string };
      };
    }[];
    payment_preferences?: {
      auto_bill_outstanding?: boolean;
      setup_fee?: { currency_code: string; value: string };
      setup_fee_failure_action?: 'CONTINUE' | 'CANCEL';
      payment_failure_threshold?: number;
    };
    taxes?: { percentage: string; inclusive: boolean };
  }): Promise<PayPalPlan> {
    return this.request('/v1/billing/plans', 'POST', params);
  }

  async getPlan(planId: string): Promise<PayPalPlan> {
    return this.request(`/v1/billing/plans/${planId}`);
  }

  async listPlans(): Promise<{ plans: PayPalPlan[]; total_items: number }> {
    return this.request('/v1/billing/plans?page_size=20&page=1&total_required=true');
  }

  async createSubscription(params: {
    plan_id: string;
    quantity?: string;
    shipping_amount?: { currency_code: string; value: string };
    subscriber?: {
      name?: { given_name: string; surname: string };
      email_address: string;
    };
    application_context?: {
      brand_name?: string;
      locale?: string;
      shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
      user_action?: 'SUBSCRIBE_NOW' | 'CONTINUE';
      return_url: string;
      cancel_url: string;
    };
    start_time?: string;
    custom_id?: string;
  }): Promise<PayPalSubscription> {
    return this.request('/v1/billing/subscriptions', 'POST', params);
  }

  async getSubscription(subscriptionId: string): Promise<PayPalSubscription> {
    return this.request(`/v1/billing/subscriptions/${subscriptionId}`);
  }

  async suspendSubscription(subscriptionId: string, reason: string): Promise<void> {
    return this.request(`/v1/billing/subscriptions/${subscriptionId}/suspend`, 'POST', { reason });
  }

  async activateSubscription(subscriptionId: string, reason: string): Promise<void> {
    return this.request(`/v1/billing/subscriptions/${subscriptionId}/activate`, 'POST', { reason });
  }

  async cancelSubscription(subscriptionId: string, reason: string): Promise<void> {
    return this.request(`/v1/billing/subscriptions/${subscriptionId}/cancel`, 'POST', { reason });
  }

  // ============ WEBHOOKS ============

  async createWebhook(params: {
    url: string;
    event_types: { name: string }[];
  }): Promise<{ id: string; url: string; event_types: { name: string }[] }> {
    return this.request('/v1/notifications/webhooks', 'POST', params);
  }

  async listWebhooks(): Promise<{ webhooks: { id: string; url: string; event_types: { name: string }[] }[] }> {
    return this.request('/v1/notifications/webhooks');
  }

  async verifyWebhookSignature(params: {
    auth_algo: string;
    cert_url: string;
    transmission_id: string;
    transmission_sig: string;
    transmission_time: string;
    webhook_id: string;
    webhook_event: unknown;
  }): Promise<{ verification_status: 'SUCCESS' | 'FAILURE' }> {
    return this.request('/v1/notifications/verify-webhook-signature', 'POST', params);
  }

  // ============ HELPER METHODS ============

  async testConnection(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch {
      return false;
    }
  }

  getApprovalUrl(order: PayPalOrder): string | null {
    const approveLink = order.links.find(link => link.rel === 'approve');
    return approveLink?.href || null;
  }

  async createQuickPayment(params: {
    orderId: string;
    amount: number;
    currency: string;
    description: string;
    returnUrl: string;
    cancelUrl: string;
    items?: {
      name: string;
      quantity: number;
      unitPrice: number;
    }[];
  }): Promise<{ orderId: string; approvalUrl: string }> {
    const items = params.items?.map(item => ({
      name: item.name,
      unit_amount: { currency_code: params.currency, value: item.unitPrice.toFixed(2) },
      quantity: item.quantity.toString(),
      category: 'DIGITAL_GOODS' as const,
    }));

    const order = await this.createOrder({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: params.orderId,
        custom_id: params.orderId,
        description: params.description,
        amount: {
          currency_code: params.currency,
          value: params.amount.toFixed(2),
          breakdown: items ? {
            item_total: { currency_code: params.currency, value: params.amount.toFixed(2) },
          } : undefined,
        },
        items,
      }],
      application_context: {
        brand_name: this.config.brandName,
        landing_page: 'NO_PREFERENCE',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    });

    const approvalUrl = this.getApprovalUrl(order);
    if (!approvalUrl) {
      throw new Error('No approval URL found in order response');
    }

    return { orderId: order.id, approvalUrl };
  }

  async processReturn(paypalOrderId: string): Promise<{
    success: boolean;
    captureId?: string;
    amount?: { currency: string; value: string };
    status: string;
  }> {
    const order = await this.captureOrder(paypalOrderId);
    
    const capture = order.purchase_units?.[0]?.payments?.captures?.[0];
    
    return {
      success: order.status === 'COMPLETED',
      captureId: capture?.id,
      amount: capture ? { currency: capture.amount.currency_code, value: capture.amount.value } : undefined,
      status: order.status,
    };
  }
}

export default PayPalAPI;

// Singleton instance
let paypalInstance: PayPalAPI | null = null;

export const initPayPal = (config: PayPalConfig): PayPalAPI => {
  paypalInstance = new PayPalAPI(config);
  return paypalInstance;
};

export const getPayPal = (): PayPalAPI | null => {
  return paypalInstance;
};
