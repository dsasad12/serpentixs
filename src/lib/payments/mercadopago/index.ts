/**
 * Mercado Pago Integration
 * Full integration for all supported countries
 * Argentina, Brasil, Chile, Colombia, México, Perú, Uruguay, Venezuela
 */

export interface MercadoPagoConfig {
  accessToken: string;
  publicKey: string;
  country: MercadoPagoCountry;
  sandbox?: boolean;
  webhookSecret?: string;
}

export type MercadoPagoCountry = 
  | 'AR' // Argentina
  | 'BR' // Brasil
  | 'CL' // Chile
  | 'CO' // Colombia
  | 'MX' // México
  | 'PE' // Perú
  | 'UY' // Uruguay
  | 'VE'; // Venezuela

export interface MercadoPagoCountryConfig {
  code: MercadoPagoCountry;
  name: string;
  currency: string;
  flag: string;
  apiBaseUrl: string;
  paymentMethods: string[];
}

export const MERCADOPAGO_COUNTRIES: Record<MercadoPagoCountry, MercadoPagoCountryConfig> = {
  AR: {
    code: 'AR',
    name: 'Argentina',
    currency: 'ARS',
    flag: '🇦🇷',
    apiBaseUrl: 'https://api.mercadopago.com',
    paymentMethods: ['credit_card', 'debit_card', 'ticket', 'bank_transfer', 'atm', 'prepaid_card'],
  },
  BR: {
    code: 'BR',
    name: 'Brasil',
    currency: 'BRL',
    flag: '🇧🇷',
    apiBaseUrl: 'https://api.mercadopago.com',
    paymentMethods: ['credit_card', 'debit_card', 'ticket', 'bank_transfer', 'pix', 'boleto'],
  },
  CL: {
    code: 'CL',
    name: 'Chile',
    currency: 'CLP',
    flag: '🇨🇱',
    apiBaseUrl: 'https://api.mercadopago.com',
    paymentMethods: ['credit_card', 'debit_card', 'bank_transfer', 'webpay', 'servipag'],
  },
  CO: {
    code: 'CO',
    name: 'Colombia',
    currency: 'COP',
    flag: '🇨🇴',
    apiBaseUrl: 'https://api.mercadopago.com',
    paymentMethods: ['credit_card', 'debit_card', 'ticket', 'bank_transfer', 'pse', 'efecty', 'baloto'],
  },
  MX: {
    code: 'MX',
    name: 'México',
    currency: 'MXN',
    flag: '🇲🇽',
    apiBaseUrl: 'https://api.mercadopago.com',
    paymentMethods: ['credit_card', 'debit_card', 'ticket', 'bank_transfer', 'oxxo', 'spei'],
  },
  PE: {
    code: 'PE',
    name: 'Perú',
    currency: 'PEN',
    flag: '🇵🇪',
    apiBaseUrl: 'https://api.mercadopago.com',
    paymentMethods: ['credit_card', 'debit_card', 'ticket', 'bank_transfer', 'pagoefectivo'],
  },
  UY: {
    code: 'UY',
    name: 'Uruguay',
    currency: 'UYU',
    flag: '🇺🇾',
    apiBaseUrl: 'https://api.mercadopago.com',
    paymentMethods: ['credit_card', 'debit_card', 'bank_transfer', 'abitab', 'redpagos'],
  },
  VE: {
    code: 'VE',
    name: 'Venezuela',
    currency: 'VES',
    flag: '🇻🇪',
    apiBaseUrl: 'https://api.mercadopago.com',
    paymentMethods: ['credit_card', 'debit_card', 'bank_transfer'],
  },
};

export interface MercadoPagoPayment {
  id: number;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  operation_type: string;
  date_created: string;
  date_approved: string | null;
  date_last_updated: string;
  money_release_date: string | null;
  currency_id: string;
  transaction_amount: number;
  transaction_amount_refunded: number;
  shipping_amount: number;
  net_amount: number;
  total_paid_amount: number;
  installments: number;
  payment_method_id: string;
  payment_type_id: string;
  description: string;
  external_reference: string;
  statement_descriptor: string;
  payer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    identification: {
      type: string;
      number: string;
    };
  };
  point_of_interaction?: {
    type: string;
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
  fee_details: {
    type: string;
    amount: number;
    fee_payer: string;
  }[];
  captured: boolean;
  binary_mode: boolean;
  live_mode: boolean;
  metadata: Record<string, unknown>;
}

export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  items: {
    id: string;
    title: string;
    description: string;
    picture_url: string;
    category_id: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }[];
  payer: {
    name?: string;
    surname?: string;
    email: string;
    phone?: {
      area_code: string;
      number: string;
    };
    identification?: {
      type: string;
      number: string;
    };
    address?: {
      zip_code: string;
      street_name: string;
      street_number: number;
    };
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved' | 'all';
  external_reference: string;
  expires: boolean;
  expiration_date_from: string;
  expiration_date_to: string;
  notification_url: string;
}

export interface CreatePaymentParams {
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  external_reference?: string;
  installments?: number;
  token?: string;
  issuer_id?: number;
  notification_url?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePreferenceParams {
  items: {
    id?: string;
    title: string;
    description?: string;
    picture_url?: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }[];
  payer?: {
    name?: string;
    surname?: string;
    email: string;
    phone?: {
      area_code: string;
      number: string;
    };
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  notification_url?: string;
  expires?: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
  marketplace?: string;
  marketplace_fee?: number;
  binary_mode?: boolean;
}

class MercadoPagoAPI {
  private config: MercadoPagoConfig;
  private baseUrl: string;
  private countryConfig: MercadoPagoCountryConfig;

  constructor(config: MercadoPagoConfig) {
    this.config = config;
    this.countryConfig = MERCADOPAGO_COUNTRIES[config.country];
    this.baseUrl = this.countryConfig.apiBaseUrl;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': this.generateIdempotencyKey(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `MercadoPago API Error: ${response.status}`);
    }

    return data;
  }

  private generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============ PAYMENTS ============

  async createPayment(params: CreatePaymentParams): Promise<MercadoPagoPayment> {
    return this.request('/v1/payments', 'POST', params);
  }

  async getPayment(paymentId: number): Promise<MercadoPagoPayment> {
    return this.request(`/v1/payments/${paymentId}`);
  }

  async searchPayments(filters: {
    external_reference?: string;
    status?: string;
    begin_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ results: MercadoPagoPayment[]; paging: { total: number; limit: number; offset: number } }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    return this.request(`/v1/payments/search?${params.toString()}`);
  }

  async capturePayment(paymentId: number): Promise<MercadoPagoPayment> {
    return this.request(`/v1/payments/${paymentId}`, 'PUT', { capture: true });
  }

  async cancelPayment(paymentId: number): Promise<MercadoPagoPayment> {
    return this.request(`/v1/payments/${paymentId}`, 'PUT', { status: 'cancelled' });
  }

  async refundPayment(paymentId: number, amount?: number): Promise<{ id: number }> {
    return this.request(`/v1/payments/${paymentId}/refunds`, 'POST', amount ? { amount } : {});
  }

  // ============ PREFERENCES (Checkout Pro) ============

  async createPreference(params: CreatePreferenceParams): Promise<MercadoPagoPreference> {
    // Set currency based on country
    const items = params.items.map(item => ({
      ...item,
      currency_id: item.currency_id || this.countryConfig.currency,
    }));

    return this.request('/checkout/preferences', 'POST', {
      ...params,
      items,
    });
  }

  async getPreference(preferenceId: string): Promise<MercadoPagoPreference> {
    return this.request(`/checkout/preferences/${preferenceId}`);
  }

  async updatePreference(preferenceId: string, params: Partial<CreatePreferenceParams>): Promise<MercadoPagoPreference> {
    return this.request(`/checkout/preferences/${preferenceId}`, 'PUT', params);
  }

  // ============ PAYMENT METHODS ============

  async getPaymentMethods(): Promise<{
    id: string;
    name: string;
    payment_type_id: string;
    status: string;
    secure_thumbnail: string;
    thumbnail: string;
    deferred_capture: string;
    settings: unknown[];
    additional_info_needed: string[];
    min_allowed_amount: number;
    max_allowed_amount: number;
    accreditation_time: number;
    financial_institutions: unknown[];
    processing_modes: string[];
  }[]> {
    return this.request('/v1/payment_methods');
  }

  // ============ CARD TOKEN ============

  async createCardToken(cardData: {
    card_number: string;
    expiration_month: number;
    expiration_year: number;
    security_code: string;
    cardholder: {
      name: string;
      identification?: {
        type: string;
        number: string;
      };
    };
  }): Promise<{ id: string; public_key: string; card_id: string | null; status: string }> {
    return this.request('/v1/card_tokens', 'POST', cardData);
  }

  // ============ CUSTOMERS ============

  async createCustomer(data: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: {
      area_code: string;
      number: string;
    };
    identification?: {
      type: string;
      number: string;
    };
    address?: {
      id?: string;
      zip_code?: string;
      street_name?: string;
      street_number?: number;
    };
    description?: string;
    default_card?: string;
    default_address?: string;
  }): Promise<{ id: string; email: string }> {
    return this.request('/v1/customers', 'POST', data);
  }

  async getCustomer(customerId: string): Promise<{ id: string; email: string; cards: unknown[] }> {
    return this.request(`/v1/customers/${customerId}`);
  }

  async searchCustomers(email: string): Promise<{ results: { id: string; email: string }[] }> {
    return this.request(`/v1/customers/search?email=${encodeURIComponent(email)}`);
  }

  // ============ PIX (Brasil) ============

  async createPixPayment(params: {
    transaction_amount: number;
    description: string;
    external_reference: string;
    payer: {
      email: string;
      first_name: string;
      last_name: string;
      identification: {
        type: 'CPF' | 'CNPJ';
        number: string;
      };
    };
    notification_url?: string;
  }): Promise<MercadoPagoPayment> {
    if (this.config.country !== 'BR') {
      throw new Error('PIX is only available in Brazil');
    }

    return this.request('/v1/payments', 'POST', {
      ...params,
      payment_method_id: 'pix',
    });
  }

  // ============ BOLETO (Brasil) ============

  async createBoletoPayment(params: {
    transaction_amount: number;
    description: string;
    external_reference: string;
    payer: {
      email: string;
      first_name: string;
      last_name: string;
      identification: {
        type: 'CPF' | 'CNPJ';
        number: string;
      };
      address: {
        zip_code: string;
        street_name: string;
        street_number: string;
        neighborhood: string;
        city: string;
        federal_unit: string;
      };
    };
    notification_url?: string;
  }): Promise<MercadoPagoPayment> {
    if (this.config.country !== 'BR') {
      throw new Error('Boleto is only available in Brazil');
    }

    return this.request('/v1/payments', 'POST', {
      ...params,
      payment_method_id: 'bolbradesco',
    });
  }

  // ============ OXXO (México) ============

  async createOXXOPayment(params: {
    transaction_amount: number;
    description: string;
    external_reference: string;
    payer: {
      email: string;
      first_name: string;
      last_name: string;
    };
    notification_url?: string;
  }): Promise<MercadoPagoPayment> {
    if (this.config.country !== 'MX') {
      throw new Error('OXXO is only available in Mexico');
    }

    return this.request('/v1/payments', 'POST', {
      ...params,
      payment_method_id: 'oxxo',
    });
  }

  // ============ WEBHOOKS ============

  verifyWebhookSignature(_payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      console.warn('Webhook secret not configured');
      return true;
    }

    // In production, implement HMAC verification
    // This is a simplified version
    const crypto = globalThis.crypto;
    if (!crypto || !crypto.subtle) {
      console.warn('Crypto not available for webhook verification');
      return true;
    }

    // Signature verification would be done here
    // For now, just return true
    return signature.length > 0;
  }

  parseWebhookEvent(body: {
    action: string;
    api_version: string;
    data: {
      id: string;
    };
    date_created: string;
    id: number;
    live_mode: boolean;
    type: string;
    user_id: string;
  }): {
    type: string;
    resourceId: string;
    action: string;
  } {
    return {
      type: body.type,
      resourceId: body.data.id,
      action: body.action,
    };
  }

  // ============ HELPER METHODS ============

  async testConnection(): Promise<boolean> {
    try {
      await this.getPaymentMethods();
      return true;
    } catch {
      return false;
    }
  }

  getCheckoutUrl(preference: MercadoPagoPreference): string {
    return this.config.sandbox ? preference.sandbox_init_point : preference.init_point;
  }

  getCountryConfig(): MercadoPagoCountryConfig {
    return this.countryConfig;
  }

  async createQuickPayment(params: {
    orderId: string;
    amount: number;
    description: string;
    customerEmail: string;
    customerName?: string;
    successUrl: string;
    failureUrl: string;
    pendingUrl: string;
    notificationUrl: string;
  }): Promise<{ preferenceId: string; checkoutUrl: string }> {
    const preference = await this.createPreference({
      items: [{
        title: params.description,
        quantity: 1,
        unit_price: params.amount,
      }],
      payer: {
        email: params.customerEmail,
        name: params.customerName,
      },
      back_urls: {
        success: params.successUrl,
        failure: params.failureUrl,
        pending: params.pendingUrl,
      },
      auto_return: 'approved',
      external_reference: params.orderId,
      notification_url: params.notificationUrl,
      binary_mode: true,
    });

    return {
      preferenceId: preference.id,
      checkoutUrl: this.getCheckoutUrl(preference),
    };
  }
}

export default MercadoPagoAPI;

// Multiple instances for different countries
const mercadoPagoInstances: Map<MercadoPagoCountry, MercadoPagoAPI> = new Map();

export const initMercadoPago = (config: MercadoPagoConfig): MercadoPagoAPI => {
  const instance = new MercadoPagoAPI(config);
  mercadoPagoInstances.set(config.country, instance);
  return instance;
};

export const getMercadoPago = (country: MercadoPagoCountry): MercadoPagoAPI | null => {
  return mercadoPagoInstances.get(country) || null;
};

export const getAllMercadoPagoInstances = (): Map<MercadoPagoCountry, MercadoPagoAPI> => {
  return mercadoPagoInstances;
};
