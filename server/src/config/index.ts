import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // App
  appName: process.env.APP_NAME || 'SerpentixPay',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  env: process.env.APP_ENV || 'development',
  debug: process.env.APP_DEBUG === 'true',
  timezone: process.env.APP_TIMEZONE || 'UTC',
  locale: process.env.APP_LOCALE || 'es',

  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'development-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  sessionSecret: process.env.SESSION_SECRET || 'session-secret-change-in-production',

  // Mail
  mail: {
    enabled: process.env.MAIL_ENABLED === 'true',
    host: process.env.MAIL_HOST || '',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    fromName: process.env.MAIL_FROM_NAME || 'SerpentixPay',
    fromAddress: process.env.MAIL_FROM_ADDRESS || 'noreply@example.com',
  },

  // Payment Gateways
  stripe: {
    enabled: process.env.STRIPE_ENABLED === 'true',
    publicKey: process.env.STRIPE_PUBLIC_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  paypal: {
    enabled: process.env.PAYPAL_ENABLED === 'true',
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    mode: process.env.PAYPAL_MODE || 'sandbox',
  },

  mercadopago: {
    enabled: process.env.MERCADOPAGO_ENABLED === 'true',
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  },

  // Storage
  storageDriver: process.env.STORAGE_DRIVER || 'local',
  storagePath: process.env.STORAGE_PATH || './uploads',

  // Integrations
  pterodactyl: {
    enabled: process.env.PTERODACTYL_ENABLED === 'true',
    url: process.env.PTERODACTYL_URL || '',
    apiKey: process.env.PTERODACTYL_API_KEY || '',
  },

  cpanel: {
    enabled: process.env.CPANEL_ENABLED === 'true',
    host: process.env.CPANEL_HOST || '',
    user: process.env.CPANEL_USER || '',
    apiToken: process.env.CPANEL_API_TOKEN || '',
  },

  proxmox: {
    enabled: process.env.PROXMOX_ENABLED === 'true',
    host: process.env.PROXMOX_HOST || '',
    user: process.env.PROXMOX_USER || '',
    tokenId: process.env.PROXMOX_TOKEN_ID || '',
    tokenSecret: process.env.PROXMOX_TOKEN_SECRET || '',
  },

  // Company
  company: {
    name: process.env.COMPANY_NAME || 'Mi Empresa Hosting',
    logo: process.env.COMPANY_LOGO || '/logo.png',
    favicon: process.env.COMPANY_FAVICON || '/favicon.ico',
    address: process.env.COMPANY_ADDRESS || '',
    phone: process.env.COMPANY_PHONE || '',
    email: process.env.COMPANY_EMAIL || 'contacto@example.com',
  },

  // Theme
  theme: {
    primaryColor: process.env.THEME_PRIMARY_COLOR || '6366f1',
    accentColor: process.env.THEME_ACCENT_COLOR || 'd946ef',
    darkMode: process.env.THEME_DARK_MODE !== 'false',
  },

  // Billing
  billing: {
    currency: process.env.CURRENCY || 'USD',
    currencySymbol: process.env.CURRENCY_SYMBOL || '$',
    taxEnabled: process.env.TAX_ENABLED === 'true',
    taxRate: parseFloat(process.env.TAX_RATE || '16'),
    taxName: process.env.TAX_NAME || 'IVA',
    invoicePrefix: process.env.INVOICE_PREFIX || 'INV-',
    invoiceDueDays: parseInt(process.env.INVOICE_DUE_DAYS || '7', 10),
  },

  // Logging
  log: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/serpentixpay.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: process.env.LOG_MAX_FILES || '7',
  },
};

// Validate critical configuration
export function validateConfig() {
  const errors: string[] = [];

  if (config.env === 'production') {
    if (config.jwtSecret === 'development-secret-change-in-production') {
      errors.push('JWT_SECRET debe ser configurado en producción');
    }
    if (config.jwtRefreshSecret === 'development-refresh-secret') {
      errors.push('JWT_REFRESH_SECRET debe ser configurado en producción');
    }
    if (config.sessionSecret === 'session-secret-change-in-production') {
      errors.push('SESSION_SECRET debe ser configurado en producción');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Errores de configuración:\n${errors.join('\n')}`);
  }
}

export default config;
