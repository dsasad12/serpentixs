/**
 * Payments Index
 * Export all payment gateways
 */

// MercadoPago - exports and local imports
export {
  default as MercadoPagoAPI,
  initMercadoPago,
  getMercadoPago,
  getAllMercadoPagoInstances,
  MERCADOPAGO_COUNTRIES,
  type MercadoPagoConfig,
  type MercadoPagoCountry,
  type MercadoPagoCountryConfig,
  type MercadoPagoPayment,
  type MercadoPagoPreference,
  type CreatePaymentParams as MercadoPagoCreatePaymentParams,
  type CreatePreferenceParams,
} from './mercadopago';

// Local imports for internal use
import {
  getMercadoPago,
  getAllMercadoPagoInstances,
  MERCADOPAGO_COUNTRIES,
  type MercadoPagoCountry,
} from './mercadopago';

// PayPal - exports and local imports
export {
  default as PayPalAPI,
  initPayPal,
  getPayPal,
  type PayPalConfig,
  type PayPalOrder,
  type PayPalCapture,
  type PayPalSubscription,
  type PayPalPlan,
  type CreateOrderParams as PayPalCreateOrderParams,
} from './paypal';

import { getPayPal } from './paypal';

// Crypto - exports and local imports
export {
  default as CryptoPaymentAPI,
  initCrypto,
  getCrypto,
  type CryptoConfig,
  type CryptoProvider,
  type CryptoCurrency,
  type CryptoPayment,
  type CreateCryptoPaymentParams,
} from './crypto';

import { getCrypto } from './crypto';

// Bank Transfer - exports and local imports
export {
  default as BankTransferManager,
  MeruAPI,
  initBankTransfer,
  getBankTransfer,
  type MeruConfig,
  type MeruAccount,
  type MeruTransaction,
  type BankAccount,
  type BankRegion,
  type BankTransferPayment,
  type CreateBankTransferParams,
} from './banktransfer';

import {
  getBankTransfer,
  type BankAccount,
  type BankRegion,
} from './banktransfer';

// Payment types
export type PaymentGateway = 'mercadopago' | 'paypal' | 'crypto' | 'banktransfer';

export interface PaymentGatewayStatus {
  gateway: PaymentGateway;
  name: string;
  isConfigured: boolean;
  isConnected: boolean;
  countries?: string[];
  currencies?: string[];
  lastCheck: string | null;
  error?: string;
}

// Helper to check all payment gateways status
export const checkPaymentGatewaysStatus = async (): Promise<PaymentGatewayStatus[]> => {
  const results: PaymentGatewayStatus[] = [];

  // Check MercadoPago instances
  const mpInstances = getAllMercadoPagoInstances();
  if (mpInstances.size > 0) {
    const countries: string[] = [];
    let anyConnected = false;
    
    for (const [country, instance] of mpInstances) {
      countries.push(country);
      const isConnected = await instance.testConnection();
      if (isConnected) anyConnected = true;
    }

    results.push({
      gateway: 'mercadopago',
      name: 'Mercado Pago',
      isConfigured: true,
      isConnected: anyConnected,
      countries,
      currencies: countries.map(c => MERCADOPAGO_COUNTRIES[c as MercadoPagoCountry]?.currency).filter(Boolean),
      lastCheck: new Date().toISOString(),
    });
  } else {
    results.push({
      gateway: 'mercadopago',
      name: 'Mercado Pago',
      isConfigured: false,
      isConnected: false,
      lastCheck: null,
    });
  }

  // Check PayPal
  const paypal = getPayPal();
  if (paypal) {
    const isConnected = await paypal.testConnection();
    results.push({
      gateway: 'paypal',
      name: 'PayPal',
      isConfigured: true,
      isConnected,
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'BRL', 'MXN'],
      lastCheck: new Date().toISOString(),
    });
  } else {
    results.push({
      gateway: 'paypal',
      name: 'PayPal',
      isConfigured: false,
      isConnected: false,
      lastCheck: null,
    });
  }

  // Check Crypto
  const crypto = getCrypto();
  if (crypto) {
    const isConnected = await crypto.testConnection();
    results.push({
      gateway: 'crypto',
      name: `Crypto (${crypto.getProvider()})`,
      isConfigured: true,
      isConnected,
      currencies: ['BTC', 'ETH', 'LTC', 'USDT', 'USDC'],
      lastCheck: new Date().toISOString(),
    });
  } else {
    results.push({
      gateway: 'crypto',
      name: 'Crypto',
      isConfigured: false,
      isConnected: false,
      lastCheck: null,
    });
  }

  // Check Bank Transfer
  const bankTransfer = getBankTransfer();
  if (bankTransfer) {
    const accounts = bankTransfer.getAllBankAccounts();
    const activeAccounts = accounts.filter((a: BankAccount) => a.isActive);
    results.push({
      gateway: 'banktransfer',
      name: 'Bank Transfer',
      isConfigured: accounts.length > 0,
      isConnected: activeAccounts.length > 0,
      countries: [...new Set(activeAccounts.map((a: BankAccount) => a.country))] as string[],
      currencies: [...new Set(activeAccounts.map((a: BankAccount) => a.currency))] as string[],
      lastCheck: new Date().toISOString(),
    });
  } else {
    results.push({
      gateway: 'banktransfer',
      name: 'Bank Transfer',
      isConfigured: false,
      isConnected: false,
      lastCheck: null,
    });
  }

  return results;
};

// Unified payment interface
export interface UnifiedPaymentRequest {
  gateway: PaymentGateway;
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
  notificationUrl?: string;
  metadata?: Record<string, unknown>;
  // Gateway-specific options
  mercadoPagoCountry?: MercadoPagoCountry;
  cryptoCurrency?: string;
  bankRegion?: BankRegion;
}

export interface UnifiedPaymentResponse {
  success: boolean;
  paymentId: string;
  gateway: PaymentGateway;
  redirectUrl?: string;
  paymentData?: {
    address?: string;
    amount?: number;
    currency?: string;
    reference?: string;
    qrCode?: string;
    bankAccount?: BankAccount;
  };
  expiresAt?: string;
  error?: string;
}

// Unified payment processor
export const createPayment = async (request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse> => {
  try {
    switch (request.gateway) {
      case 'mercadopago': {
        const country = request.mercadoPagoCountry || 'MX';
        const mp = getMercadoPago(country);
        if (!mp) throw new Error(`MercadoPago not configured for ${country}`);
        
        const result = await mp.createQuickPayment({
          orderId: request.orderId,
          amount: request.amount,
          description: request.description,
          customerEmail: request.customerEmail,
          customerName: request.customerName,
          successUrl: request.successUrl,
          failureUrl: request.cancelUrl,
          pendingUrl: request.successUrl,
          notificationUrl: request.notificationUrl || '',
        });
        
        return {
          success: true,
          paymentId: result.preferenceId,
          gateway: 'mercadopago',
          redirectUrl: result.checkoutUrl,
        };
      }

      case 'paypal': {
        const paypal = getPayPal();
        if (!paypal) throw new Error('PayPal not configured');
        
        const result = await paypal.createQuickPayment({
          orderId: request.orderId,
          amount: request.amount,
          currency: request.currency,
          description: request.description,
          returnUrl: request.successUrl,
          cancelUrl: request.cancelUrl,
        });
        
        return {
          success: true,
          paymentId: result.orderId,
          gateway: 'paypal',
          redirectUrl: result.approvalUrl,
        };
      }

      case 'crypto': {
        const crypto = getCrypto();
        if (!crypto) throw new Error('Crypto payments not configured');
        if (!request.cryptoCurrency) throw new Error('Crypto currency not specified');
        
        const payment = await crypto.createPayment({
          orderId: request.orderId,
          amount: request.amount,
          currency: request.currency,
          payCurrency: request.cryptoCurrency,
          description: request.description,
          callbackUrl: request.notificationUrl,
          successUrl: request.successUrl,
          cancelUrl: request.cancelUrl,
          buyerEmail: request.customerEmail,
        });
        
        return {
          success: true,
          paymentId: payment.id,
          gateway: 'crypto',
          redirectUrl: payment.paymentUrl,
          paymentData: {
            address: payment.payAddress,
            amount: payment.payAmount,
            currency: payment.payCurrency,
            qrCode: payment.qrCodeUrl,
          },
          expiresAt: payment.expiresAt,
        };
      }

      case 'banktransfer': {
        const bankTransfer = getBankTransfer();
        if (!bankTransfer) throw new Error('Bank transfer not configured');
        if (!request.bankRegion) throw new Error('Bank region not specified');
        
        const payment = bankTransfer.createPayment({
          orderId: request.orderId,
          amount: request.amount,
          currency: request.currency,
          region: request.bankRegion,
          customerName: request.customerName,
          customerEmail: request.customerEmail,
          description: request.description,
        });
        
        return {
          success: true,
          paymentId: payment.id,
          gateway: 'banktransfer',
          paymentData: {
            reference: payment.reference,
            amount: payment.amount,
            currency: payment.currency,
            bankAccount: payment.bankAccount,
          },
          expiresAt: payment.expiresAt,
        };
      }

      default:
        throw new Error(`Unknown payment gateway: ${request.gateway}`);
    }
  } catch (error) {
    return {
      success: false,
      paymentId: '',
      gateway: request.gateway,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
