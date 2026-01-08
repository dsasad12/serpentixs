/**
 * Bank Transfer Payment Integration
 * Supports Meru bank accounts for Europe, USA, and Mexico
 * Also supports manual bank transfer verification
 */

export type BankRegion = 'europe' | 'usa' | 'mexico' | 'other';

export interface BankAccount {
  id: string;
  region: BankRegion;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  routingNumber?: string; // USA (ABA/Routing)
  iban?: string; // Europe
  bic?: string; // SWIFT/BIC
  clabe?: string; // Mexico (CLABE)
  currency: string;
  country: string;
  isActive: boolean;
  instructions?: string;
}

export interface MeruConfig {
  apiKey: string;
  secretKey: string;
  sandbox?: boolean;
  webhookSecret?: string;
}

export interface MeruAccount {
  id: string;
  type: 'virtual' | 'physical';
  region: BankRegion;
  currency: string;
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  iban?: string;
  bic?: string;
  clabe?: string;
  balance: number;
  status: 'active' | 'pending' | 'suspended';
}

export interface MeruTransaction {
  id: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  reference: string;
  senderName?: string;
  senderBank?: string;
  senderAccount?: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
}

export interface BankTransferPayment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'awaiting_confirmation' | 'confirmed' | 'failed' | 'expired' | 'refunded';
  bankAccount: BankAccount;
  reference: string;
  customerName?: string;
  customerEmail?: string;
  proofOfPayment?: string;
  adminNotes?: string;
  createdAt: string;
  expiresAt: string;
  confirmedAt?: string;
}

export interface CreateBankTransferParams {
  orderId: string;
  amount: number;
  currency: string;
  region: BankRegion;
  customerName?: string;
  customerEmail?: string;
  description?: string;
  expirationHours?: number;
}

// ============ MERU API ============

class MeruAPI {
  private config: MeruConfig;
  private baseUrl: string;

  constructor(config: MeruConfig) {
    this.config = config;
    this.baseUrl = config.sandbox 
      ? 'https://sandbox-api.meru.com/v1'
      : 'https://api.meru.com/v1';
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<T> {
    const timestamp = Date.now().toString();
    const signature = await this.generateSignature(method, endpoint, timestamp, body);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-Meru-Signature': signature,
        'X-Meru-Timestamp': timestamp,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `Meru API Error: ${response.status}`);
    }

    return response.json();
  }

  private async generateSignature(method: string, endpoint: string, timestamp: string, body?: unknown): Promise<string> {
    const payload = `${method}${endpoint}${timestamp}${body ? JSON.stringify(body) : ''}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.config.secretKey);
    const msgData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  // ============ ACCOUNTS ============

  async getAccounts(): Promise<MeruAccount[]> {
    const data = await this.request<{ accounts: MeruAccount[] }>('/accounts');
    return data.accounts;
  }

  async getAccount(accountId: string): Promise<MeruAccount> {
    return this.request<MeruAccount>(`/accounts/${accountId}`);
  }

  async getAccountsByRegion(region: BankRegion): Promise<MeruAccount[]> {
    const accounts = await this.getAccounts();
    return accounts.filter(a => a.region === region && a.status === 'active');
  }

  // ============ TRANSACTIONS ============

  async getTransactions(accountId: string, params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: MeruTransaction[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/accounts/${accountId}/transactions${query}`);
  }

  async getTransaction(transactionId: string): Promise<MeruTransaction> {
    return this.request(`/transactions/${transactionId}`);
  }

  async searchTransactionByReference(reference: string): Promise<MeruTransaction | null> {
    const data = await this.request<{ transactions: MeruTransaction[] }>(
      `/transactions/search?reference=${encodeURIComponent(reference)}`
    );
    return data.transactions[0] || null;
  }

  // ============ WEBHOOKS ============

  verifyWebhook(signature: string, _payload: string): boolean {
    if (!this.config.webhookSecret) return true;
    // Implement signature verification
    return signature.length > 0;
  }

  parseWebhookEvent(body: {
    event: string;
    data: {
      transactionId: string;
      accountId: string;
      amount: number;
      currency: string;
      status: string;
      reference: string;
    };
    timestamp: string;
  }): {
    eventType: string;
    transactionId: string;
    status: string;
    reference: string;
  } {
    return {
      eventType: body.event,
      transactionId: body.data.transactionId,
      status: body.data.status,
      reference: body.data.reference,
    };
  }
}

// ============ BANK TRANSFER MANAGER ============

class BankTransferManager {
  private meruApi?: MeruAPI;
  private bankAccounts: Map<string, BankAccount> = new Map();
  private pendingPayments: Map<string, BankTransferPayment> = new Map();

  constructor(meruConfig?: MeruConfig) {
    if (meruConfig) {
      this.meruApi = new MeruAPI(meruConfig);
    }
  }

  // ============ BANK ACCOUNTS ============

  addBankAccount(account: BankAccount): void {
    this.bankAccounts.set(account.id, account);
  }

  removeBankAccount(accountId: string): void {
    this.bankAccounts.delete(accountId);
  }

  getBankAccount(accountId: string): BankAccount | undefined {
    return this.bankAccounts.get(accountId);
  }

  getBankAccountsByRegion(region: BankRegion): BankAccount[] {
    return Array.from(this.bankAccounts.values())
      .filter(a => a.region === region && a.isActive);
  }

  getAllBankAccounts(): BankAccount[] {
    return Array.from(this.bankAccounts.values());
  }

  // ============ PAYMENTS ============

  generateReference(orderId: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SP-${orderId.substring(0, 8).toUpperCase()}-${timestamp}-${random}`;
  }

  createPayment(params: CreateBankTransferParams): BankTransferPayment {
    const accounts = this.getBankAccountsByRegion(params.region);
    if (accounts.length === 0) {
      throw new Error(`No bank accounts available for region: ${params.region}`);
    }

    // Select best account based on currency match
    const account = accounts.find(a => a.currency === params.currency) || accounts[0];
    
    const expirationHours = params.expirationHours || 48;
    const payment: BankTransferPayment = {
      id: `bt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      status: 'pending',
      bankAccount: account,
      reference: this.generateReference(params.orderId),
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString(),
    };

    this.pendingPayments.set(payment.id, payment);
    return payment;
  }

  getPayment(paymentId: string): BankTransferPayment | undefined {
    return this.pendingPayments.get(paymentId);
  }

  getPaymentByReference(reference: string): BankTransferPayment | undefined {
    return Array.from(this.pendingPayments.values())
      .find(p => p.reference === reference);
  }

  getPaymentsByOrder(orderId: string): BankTransferPayment[] {
    return Array.from(this.pendingPayments.values())
      .filter(p => p.orderId === orderId);
  }

  getPendingPayments(): BankTransferPayment[] {
    return Array.from(this.pendingPayments.values())
      .filter(p => p.status === 'pending' || p.status === 'awaiting_confirmation');
  }

  updatePaymentStatus(
    paymentId: string,
    status: BankTransferPayment['status'],
    adminNotes?: string
  ): BankTransferPayment | undefined {
    const payment = this.pendingPayments.get(paymentId);
    if (!payment) return undefined;

    payment.status = status;
    if (adminNotes) payment.adminNotes = adminNotes;
    if (status === 'confirmed') payment.confirmedAt = new Date().toISOString();

    this.pendingPayments.set(paymentId, payment);
    return payment;
  }

  uploadProofOfPayment(paymentId: string, proofUrl: string): BankTransferPayment | undefined {
    const payment = this.pendingPayments.get(paymentId);
    if (!payment) return undefined;

    payment.proofOfPayment = proofUrl;
    payment.status = 'awaiting_confirmation';
    this.pendingPayments.set(paymentId, payment);
    return payment;
  }

  // ============ MERU INTEGRATION ============

  async syncMeruAccounts(): Promise<void> {
    if (!this.meruApi) {
      throw new Error('Meru API not configured');
    }

    const meruAccounts = await this.meruApi.getAccounts();
    
    for (const meruAccount of meruAccounts) {
      if (meruAccount.status !== 'active') continue;

      const bankAccount: BankAccount = {
        id: `meru_${meruAccount.id}`,
        region: meruAccount.region,
        bankName: meruAccount.bankName,
        accountHolder: 'Serpentix Pay',
        accountNumber: meruAccount.accountNumber,
        routingNumber: meruAccount.routingNumber,
        iban: meruAccount.iban,
        bic: meruAccount.bic,
        clabe: meruAccount.clabe,
        currency: meruAccount.currency,
        country: this.getCountryFromRegion(meruAccount.region),
        isActive: true,
        instructions: this.getInstructionsForRegion(meruAccount.region),
      };

      this.addBankAccount(bankAccount);
    }
  }

  async checkMeruTransaction(reference: string): Promise<MeruTransaction | null> {
    if (!this.meruApi) {
      throw new Error('Meru API not configured');
    }

    return this.meruApi.searchTransactionByReference(reference);
  }

  async autoConfirmPayment(paymentId: string): Promise<boolean> {
    if (!this.meruApi) return false;

    const payment = this.getPayment(paymentId);
    if (!payment || payment.status !== 'pending') return false;

    const transaction = await this.checkMeruTransaction(payment.reference);
    if (!transaction) return false;

    if (
      transaction.status === 'completed' &&
      transaction.amount >= payment.amount
    ) {
      this.updatePaymentStatus(paymentId, 'confirmed', `Auto-confirmed via Meru transaction ${transaction.id}`);
      return true;
    }

    return false;
  }

  private getCountryFromRegion(region: BankRegion): string {
    const countryMap: Record<BankRegion, string> = {
      europe: 'EU',
      usa: 'US',
      mexico: 'MX',
      other: 'XX',
    };
    return countryMap[region];
  }

  private getInstructionsForRegion(region: BankRegion): string {
    const instructions: Record<BankRegion, string> = {
      europe: 'Para transferencias SEPA, utilice el IBAN proporcionado. El BIC es necesario para transferencias internacionales.',
      usa: 'Utilice el Routing Number (ABA) para transferencias ACH o wire transfers dentro de Estados Unidos.',
      mexico: 'Utilice la CLABE de 18 dígitos para transferencias SPEI interbancarias en México.',
      other: 'Por favor contacte soporte para instrucciones de pago específicas para su región.',
    };
    return instructions[region];
  }

  // ============ DEFAULT BANK ACCOUNTS SETUP ============

  setupDefaultAccounts(): void {
    // Meru Europe Account (SEPA)
    this.addBankAccount({
      id: 'meru_europe',
      region: 'europe',
      bankName: 'Meru Bank (Europe)',
      accountHolder: 'Serpentix Pay SL',
      accountNumber: '',
      iban: 'ES00 0000 0000 0000 0000 0000', // Placeholder - configure in admin
      bic: 'MERUESMM',
      currency: 'EUR',
      country: 'ES',
      isActive: false, // Enable after configuration
      instructions: 'Realice una transferencia SEPA al IBAN indicado. Incluya el número de referencia en el concepto.',
    });

    // Meru USA Account
    this.addBankAccount({
      id: 'meru_usa',
      region: 'usa',
      bankName: 'Meru Bank (USA)',
      accountHolder: 'Serpentix Pay LLC',
      accountNumber: '000000000000', // Placeholder
      routingNumber: '000000000', // Placeholder
      currency: 'USD',
      country: 'US',
      isActive: false,
      instructions: 'Wire transfer or ACH to the account number with routing number. Include the reference number in memo.',
    });

    // Meru Mexico Account
    this.addBankAccount({
      id: 'meru_mexico',
      region: 'mexico',
      bankName: 'Meru Bank (México)',
      accountHolder: 'Serpentix Pay SA de CV',
      accountNumber: '',
      clabe: '000000000000000000', // Placeholder
      currency: 'MXN',
      country: 'MX',
      isActive: false,
      instructions: 'Realice una transferencia SPEI a la CLABE indicada. Incluya el número de referencia en el concepto.',
    });
  }

  // ============ EXPIRATION CHECK ============

  checkExpiredPayments(): BankTransferPayment[] {
    const now = new Date();
    const expired: BankTransferPayment[] = [];

    for (const payment of this.pendingPayments.values()) {
      if (
        payment.status === 'pending' &&
        new Date(payment.expiresAt) < now
      ) {
        payment.status = 'expired';
        expired.push(payment);
      }
    }

    return expired;
  }
}

export default BankTransferManager;

// Export Meru API separately
export { MeruAPI };

// Singleton instance
let bankTransferInstance: BankTransferManager | null = null;

export const initBankTransfer = (meruConfig?: MeruConfig): BankTransferManager => {
  bankTransferInstance = new BankTransferManager(meruConfig);
  bankTransferInstance.setupDefaultAccounts();
  return bankTransferInstance;
};

export const getBankTransfer = (): BankTransferManager | null => {
  return bankTransferInstance;
};
