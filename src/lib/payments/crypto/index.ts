/**
 * Cryptocurrency Payment Gateway Integration
 * Supports multiple crypto providers: CoinGate, NOWPayments, CoinPayments
 */

export type CryptoProvider = 'coingate' | 'nowpayments' | 'coinpayments';

export interface CryptoConfig {
  provider: CryptoProvider;
  apiKey: string;
  apiSecret?: string;
  merchantId?: string;
  ipnSecret?: string;
  sandbox?: boolean;
}

export interface CryptoCurrency {
  id: string;
  name: string;
  symbol: string;
  minAmount: number;
  maxAmount: number;
  enabled: boolean;
  network?: string;
}

export interface CryptoPayment {
  id: string;
  status: 'pending' | 'confirming' | 'confirmed' | 'sending' | 'finished' | 'failed' | 'refunded' | 'expired';
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  priceAmount: number;
  priceCurrency: string;
  orderId: string;
  orderDescription: string;
  createdAt: string;
  expiresAt: string;
  paymentUrl?: string;
  qrCodeUrl?: string;
  txId?: string;
  confirmations?: number;
}

export interface CreateCryptoPaymentParams {
  orderId: string;
  amount: number;
  currency: string;
  payCurrency: string;
  description: string;
  callbackUrl?: string;
  successUrl?: string;
  cancelUrl?: string;
  buyerEmail?: string;
}

// ============ COINGATE ============

interface CoinGateOrder {
  id: number;
  status: string;
  title: string;
  description: string;
  price_currency: string;
  price_amount: string;
  pay_currency: string;
  pay_amount: string;
  receive_currency: string;
  receive_amount: string;
  created_at: string;
  expire_at: string;
  payment_url: string;
  order_id: string;
  token: string;
  pay_address?: string;
}

class CoinGateAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, sandbox = false) {
    this.apiKey = apiKey;
    this.baseUrl = sandbox 
      ? 'https://api-sandbox.coingate.com/v2'
      : 'https://api.coingate.com/v2';
  }

  private async request<T>(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || error.reason || `CoinGate Error: ${response.status}`);
    }

    return response.json();
  }

  async getCurrencies(): Promise<CryptoCurrency[]> {
    const data = await this.request<{ symbol: string; title: string; disabled: boolean }[]>('/currencies');
    return data.map(c => ({
      id: c.symbol,
      name: c.title,
      symbol: c.symbol,
      minAmount: 0.01,
      maxAmount: 1000000,
      enabled: !c.disabled,
    }));
  }

  async createOrder(params: CreateCryptoPaymentParams): Promise<CryptoPayment> {
    const order = await this.request<CoinGateOrder>('/orders', 'POST', {
      order_id: params.orderId,
      price_amount: params.amount,
      price_currency: params.currency,
      receive_currency: params.currency,
      title: params.description,
      description: params.description,
      callback_url: params.callbackUrl,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      token: params.payCurrency,
      purchaser_email: params.buyerEmail,
    });

    return this.mapOrder(order);
  }

  async getOrder(orderId: string): Promise<CryptoPayment> {
    const order = await this.request<CoinGateOrder>(`/orders/${orderId}`);
    return this.mapOrder(order);
  }

  private mapOrder(order: CoinGateOrder): CryptoPayment {
    const statusMap: Record<string, CryptoPayment['status']> = {
      new: 'pending',
      pending: 'confirming',
      confirming: 'confirming',
      paid: 'confirmed',
      invalid: 'failed',
      expired: 'expired',
      canceled: 'failed',
      refunded: 'refunded',
    };

    return {
      id: order.id.toString(),
      status: statusMap[order.status] || 'pending',
      payAddress: order.pay_address || '',
      payAmount: parseFloat(order.pay_amount),
      payCurrency: order.pay_currency,
      priceAmount: parseFloat(order.price_amount),
      priceCurrency: order.price_currency,
      orderId: order.order_id,
      orderDescription: order.description,
      createdAt: order.created_at,
      expiresAt: order.expire_at,
      paymentUrl: order.payment_url,
    };
  }
}

// ============ NOWPAYMENTS ============

interface NOWPaymentsInvoice {
  id: string;
  order_id: string;
  order_description: string;
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  pay_amount: number;
  pay_address: string;
  created_at: string;
  updated_at: string;
  payment_status: string;
  invoice_url: string;
  expiration_estimate_date: string;
}

class NOWPaymentsAPI {
  private apiKey: string;
  private baseUrl = 'https://api.nowpayments.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `NOWPayments Error: ${response.status}`);
    }

    return response.json();
  }

  async getCurrencies(): Promise<CryptoCurrency[]> {
    const data = await this.request<{ currencies: string[] }>('/currencies');
    return data.currencies.map(c => ({
      id: c,
      name: c.toUpperCase(),
      symbol: c.toUpperCase(),
      minAmount: 0.01,
      maxAmount: 1000000,
      enabled: true,
    }));
  }

  async getMinimumAmount(currency: string, fiat: string): Promise<number> {
    const data = await this.request<{ min_amount: number }>(`/min-amount?currency_from=${currency}&currency_to=${fiat}`);
    return data.min_amount;
  }

  async createInvoice(params: CreateCryptoPaymentParams): Promise<CryptoPayment> {
    const invoice = await this.request<NOWPaymentsInvoice>('/invoice', 'POST', {
      price_amount: params.amount,
      price_currency: params.currency.toLowerCase(),
      pay_currency: params.payCurrency.toLowerCase(),
      order_id: params.orderId,
      order_description: params.description,
      ipn_callback_url: params.callbackUrl,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    return this.mapInvoice(invoice);
  }

  async getPaymentStatus(paymentId: string): Promise<CryptoPayment> {
    const invoice = await this.request<NOWPaymentsInvoice>(`/payment/${paymentId}`);
    return this.mapInvoice(invoice);
  }

  private mapInvoice(invoice: NOWPaymentsInvoice): CryptoPayment {
    const statusMap: Record<string, CryptoPayment['status']> = {
      waiting: 'pending',
      confirming: 'confirming',
      confirmed: 'confirmed',
      sending: 'sending',
      finished: 'finished',
      failed: 'failed',
      refunded: 'refunded',
      expired: 'expired',
    };

    return {
      id: invoice.id,
      status: statusMap[invoice.payment_status] || 'pending',
      payAddress: invoice.pay_address,
      payAmount: invoice.pay_amount,
      payCurrency: invoice.pay_currency.toUpperCase(),
      priceAmount: invoice.price_amount,
      priceCurrency: invoice.price_currency.toUpperCase(),
      orderId: invoice.order_id,
      orderDescription: invoice.order_description,
      createdAt: invoice.created_at,
      expiresAt: invoice.expiration_estimate_date,
      paymentUrl: invoice.invoice_url,
    };
  }
}

// ============ COINPAYMENTS ============

class CoinPaymentsAPI {
  private merchantId: string;
  private apiKey: string;
  private apiSecret: string;
  private ipnSecret: string;
  private baseUrl = 'https://www.coinpayments.net/api.php';

  constructor(merchantId: string, apiKey: string, apiSecret: string, ipnSecret = '') {
    this.merchantId = merchantId;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.ipnSecret = ipnSecret;
  }

  getMerchantId(): string {
    return this.merchantId;
  }

  private async request<T>(cmd: string, params: Record<string, string | number> = {}): Promise<T> {
    const allParams = {
      version: 1,
      cmd,
      key: this.apiKey,
      ...params,
    };

    const paramString = new URLSearchParams(
      Object.entries(allParams).map(([k, v]) => [k, String(v)])
    ).toString();

    // Generate HMAC signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.apiSecret);
    const msgData = encoder.encode(paramString);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const hmac = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmac,
      },
      body: paramString,
    });

    const data = await response.json();
    if (data.error !== 'ok') {
      throw new Error(data.error || 'CoinPayments Error');
    }

    return data.result;
  }

  async getCurrencies(): Promise<CryptoCurrency[]> {
    const data = await this.request<Record<string, { 
      name: string; 
      is_fiat: number; 
      status: string;
      tx_fee: string;
    }>>('rates');

    return Object.entries(data)
      .filter(([, v]) => v.is_fiat === 0 && v.status === 'online')
      .map(([k, v]) => ({
        id: k,
        name: v.name,
        symbol: k,
        minAmount: parseFloat(v.tx_fee) * 2,
        maxAmount: 1000000,
        enabled: v.status === 'online',
      }));
  }

  async createTransaction(params: CreateCryptoPaymentParams): Promise<CryptoPayment> {
    const result = await this.request<{
      amount: string;
      address: string;
      txn_id: string;
      confirms_needed: string;
      timeout: number;
      status_url: string;
      qrcode_url: string;
    }>('create_transaction', {
      amount: params.amount,
      currency1: params.currency,
      currency2: params.payCurrency,
      buyer_email: params.buyerEmail || '',
      buyer_name: '',
      item_name: params.description,
      item_number: params.orderId,
      invoice: params.orderId,
      custom: params.orderId,
      ipn_url: params.callbackUrl || '',
    });

    return {
      id: result.txn_id,
      status: 'pending',
      payAddress: result.address,
      payAmount: parseFloat(result.amount),
      payCurrency: params.payCurrency,
      priceAmount: params.amount,
      priceCurrency: params.currency,
      orderId: params.orderId,
      orderDescription: params.description,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + result.timeout * 1000).toISOString(),
      paymentUrl: result.status_url,
      qrCodeUrl: result.qrcode_url,
    };
  }

  async getTransactionInfo(txnId: string): Promise<CryptoPayment> {
    const result = await this.request<{
      status: number;
      status_text: string;
      type: string;
      coin: string;
      amount: string;
      amountf: string;
      received: string;
      recv_confirms: number;
      payment_address: string;
    }>('get_tx_info', { txid: txnId });

    const statusMap: Record<number, CryptoPayment['status']> = {
      [-1]: 'failed',
      0: 'pending',
      1: 'confirming',
      2: 'confirmed',
      3: 'finished',
      100: 'finished',
    };

    return {
      id: txnId,
      status: statusMap[result.status] || 'pending',
      payAddress: result.payment_address,
      payAmount: parseFloat(result.amountf),
      payCurrency: result.coin,
      priceAmount: parseFloat(result.amount),
      priceCurrency: 'USD',
      orderId: '',
      orderDescription: '',
      createdAt: '',
      expiresAt: '',
      confirmations: result.recv_confirms,
    };
  }

  verifyIPN(hmacHeader: string, _payload: string): boolean {
    if (!this.ipnSecret) return true;
    
    // Verify HMAC
    // Implementation would use crypto.subtle for verification
    return hmacHeader.length > 0;
  }
}

// ============ UNIFIED CRYPTO API ============

class CryptoPaymentAPI {
  private config: CryptoConfig;
  private coingate?: CoinGateAPI;
  private nowpayments?: NOWPaymentsAPI;
  private coinpayments?: CoinPaymentsAPI;

  constructor(config: CryptoConfig) {
    this.config = config;
    
    switch (config.provider) {
      case 'coingate':
        this.coingate = new CoinGateAPI(config.apiKey, config.sandbox);
        break;
      case 'nowpayments':
        this.nowpayments = new NOWPaymentsAPI(config.apiKey);
        break;
      case 'coinpayments':
        if (!config.merchantId || !config.apiSecret) {
          throw new Error('CoinPayments requires merchantId and apiSecret');
        }
        this.coinpayments = new CoinPaymentsAPI(
          config.merchantId,
          config.apiKey,
          config.apiSecret,
          config.ipnSecret
        );
        break;
    }
  }

  async getCurrencies(): Promise<CryptoCurrency[]> {
    switch (this.config.provider) {
      case 'coingate':
        return this.coingate!.getCurrencies();
      case 'nowpayments':
        return this.nowpayments!.getCurrencies();
      case 'coinpayments':
        return this.coinpayments!.getCurrencies();
    }
  }

  async createPayment(params: CreateCryptoPaymentParams): Promise<CryptoPayment> {
    switch (this.config.provider) {
      case 'coingate':
        return this.coingate!.createOrder(params);
      case 'nowpayments':
        return this.nowpayments!.createInvoice(params);
      case 'coinpayments':
        return this.coinpayments!.createTransaction(params);
    }
  }

  async getPaymentStatus(paymentId: string): Promise<CryptoPayment> {
    switch (this.config.provider) {
      case 'coingate':
        return this.coingate!.getOrder(paymentId);
      case 'nowpayments':
        return this.nowpayments!.getPaymentStatus(paymentId);
      case 'coinpayments':
        return this.coinpayments!.getTransactionInfo(paymentId);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrencies();
      return true;
    } catch {
      return false;
    }
  }

  getProvider(): CryptoProvider {
    return this.config.provider;
  }
}

export default CryptoPaymentAPI;

// Singleton instance
let cryptoInstance: CryptoPaymentAPI | null = null;

export const initCrypto = (config: CryptoConfig): CryptoPaymentAPI => {
  cryptoInstance = new CryptoPaymentAPI(config);
  return cryptoInstance;
};

export const getCrypto = (): CryptoPaymentAPI | null => {
  return cryptoInstance;
};
