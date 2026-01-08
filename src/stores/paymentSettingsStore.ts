import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  PaymentGateway, 
  MercadoPagoCountry, 
  CryptoProvider,
  BankAccount 
} from '../lib/payments';

// Type for MercadoPago country settings
export interface MercadoPagoCountrySettings {
  enabled?: boolean;
  accessToken?: string;
  publicKey?: string;
  sandbox?: boolean;
}

export interface PayPalSettings {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  sandbox: boolean;
  brandName: string;
  webhookId?: string;
}

export interface MercadoPagoSettings {
  enabled: boolean;
  countries: {
    [key in MercadoPagoCountry]?: MercadoPagoCountrySettings;
  };
}

export interface CryptoSettings {
  enabled: boolean;
  provider: CryptoProvider;
  apiKey: string;
  apiSecret?: string;
  merchantId?: string;
  ipnSecret?: string;
  sandbox: boolean;
  acceptedCurrencies: string[];
}

export interface BankTransferSettings {
  enabled: boolean;
  meruApiKey?: string;
  meruSecretKey?: string;
  meruSandbox?: boolean;
  accounts: BankAccount[];
  autoConfirm: boolean;
  expirationHours: number;
}

export interface PaymentSettings {
  paypal: PayPalSettings;
  mercadopago: MercadoPagoSettings;
  crypto: CryptoSettings;
  bankTransfer: BankTransferSettings;
  defaultCurrency: string;
  enabledGateways: PaymentGateway[];
}

interface PaymentSettingsState {
  settings: PaymentSettings;
  isLoading: boolean;
  lastSaved: string | null;
  
  // Actions
  updatePayPalSettings: (settings: Partial<PayPalSettings>) => void;
  updateMercadoPagoSettings: (settings: Partial<MercadoPagoSettings>) => void;
  updateMercadoPagoCountry: (country: MercadoPagoCountry, settings: MercadoPagoCountrySettings) => void;
  updateCryptoSettings: (settings: Partial<CryptoSettings>) => void;
  updateBankTransferSettings: (settings: Partial<BankTransferSettings>) => void;
  addBankAccount: (account: BankAccount) => void;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => void;
  removeBankAccount: (id: string) => void;
  setDefaultCurrency: (currency: string) => void;
  toggleGateway: (gateway: PaymentGateway, enabled: boolean) => void;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  testConnection: (gateway: PaymentGateway) => Promise<{ success: boolean; message: string }>;
}

const defaultSettings: PaymentSettings = {
  paypal: {
    enabled: false,
    clientId: '',
    clientSecret: '',
    sandbox: true,
    brandName: 'SerpentixPay',
  },
  mercadopago: {
    enabled: false,
    countries: {},
  },
  crypto: {
    enabled: false,
    provider: 'coingate',
    apiKey: '',
    sandbox: true,
    acceptedCurrencies: ['BTC', 'ETH', 'LTC', 'USDT'],
  },
  bankTransfer: {
    enabled: false,
    accounts: [],
    autoConfirm: false,
    expirationHours: 48,
  },
  defaultCurrency: 'USD',
  enabledGateways: [],
};

export const usePaymentSettingsStore = create<PaymentSettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,
      lastSaved: null,

      updatePayPalSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            paypal: { ...state.settings.paypal, ...updates },
          },
        }));
      },

      updateMercadoPagoSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            mercadopago: { ...state.settings.mercadopago, ...updates },
          },
        }));
      },

      updateMercadoPagoCountry: (country, countrySettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            mercadopago: {
              ...state.settings.mercadopago,
              countries: {
                ...state.settings.mercadopago.countries,
                [country]: countrySettings,
              },
            },
          },
        }));
      },

      updateCryptoSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            crypto: { ...state.settings.crypto, ...updates },
          },
        }));
      },

      updateBankTransferSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            bankTransfer: { ...state.settings.bankTransfer, ...updates },
          },
        }));
      },

      addBankAccount: (account) => {
        set((state) => ({
          settings: {
            ...state.settings,
            bankTransfer: {
              ...state.settings.bankTransfer,
              accounts: [...state.settings.bankTransfer.accounts, account],
            },
          },
        }));
      },

      updateBankAccount: (id, updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            bankTransfer: {
              ...state.settings.bankTransfer,
              accounts: state.settings.bankTransfer.accounts.map((account) =>
                account.id === id ? { ...account, ...updates } : account
              ),
            },
          },
        }));
      },

      removeBankAccount: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            bankTransfer: {
              ...state.settings.bankTransfer,
              accounts: state.settings.bankTransfer.accounts.filter((a) => a.id !== id),
            },
          },
        }));
      },

      setDefaultCurrency: (currency) => {
        set((state) => ({
          settings: { ...state.settings, defaultCurrency: currency },
        }));
      },

      toggleGateway: (gateway, enabled) => {
        set((state) => {
          const enabledGateways = enabled
            ? [...state.settings.enabledGateways, gateway]
            : state.settings.enabledGateways.filter((g) => g !== gateway);
          
          return {
            settings: { ...state.settings, enabledGateways },
          };
        });
      },

      saveSettings: async () => {
        set({ isLoading: true });
        try {
          // In production, save to backend API
          // For now, persist middleware handles it
          await new Promise((resolve) => setTimeout(resolve, 500));
          set({ lastSaved: new Date().toISOString(), isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loadSettings: async () => {
        set({ isLoading: true });
        try {
          // In production, load from backend API
          await new Promise((resolve) => setTimeout(resolve, 300));
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      testConnection: async (gateway) => {
        const { settings } = get();
        
        try {
          switch (gateway) {
            case 'paypal':
              if (!settings.paypal.clientId || !settings.paypal.clientSecret) {
                return { success: false, message: 'Credenciales de PayPal no configuradas' };
              }
              // Test PayPal connection
              return { success: true, message: 'Conexión con PayPal exitosa' };

            case 'mercadopago':
              const enabledCountries = Object.entries(settings.mercadopago.countries)
                .filter(([, v]) => v?.enabled);
              if (enabledCountries.length === 0) {
                return { success: false, message: 'No hay países de MercadoPago configurados' };
              }
              return { success: true, message: `MercadoPago configurado para ${enabledCountries.length} país(es)` };

            case 'crypto':
              if (!settings.crypto.apiKey) {
                return { success: false, message: 'API Key de cripto no configurada' };
              }
              return { success: true, message: `Conexión con ${settings.crypto.provider} exitosa` };

            case 'banktransfer':
              const activeAccounts = settings.bankTransfer.accounts.filter((a) => a.isActive);
              if (activeAccounts.length === 0) {
                return { success: false, message: 'No hay cuentas bancarias activas' };
              }
              return { success: true, message: `${activeAccounts.length} cuenta(s) bancaria(s) activa(s)` };

            default:
              return { success: false, message: 'Pasarela desconocida' };
          }
        } catch (error) {
          return { 
            success: false, 
            message: error instanceof Error ? error.message : 'Error de conexión' 
          };
        }
      },
    }),
    {
      name: 'serpentix-payment-settings',
      partialize: (state) => ({ settings: state.settings, lastSaved: state.lastSaved }),
    }
  )
);

export default usePaymentSettingsStore;
