import { PrismaClient, PaymentGateway, TransactionStatus, Prisma } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ============================================
// PAYMENT SERVICE
// ============================================

export const PaymentService = {
  // Generate unique reference for bank transfers
  generateBankReference(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `SPX-${timestamp}-${random}`.toUpperCase();
  },

  // Generate transaction ID
  generateTransactionId(): string {
    return `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  },

  // Create payment record
  async createPayment(data: {
    invoiceId: string;
    gateway: PaymentGateway;
    amount: number;
    currency: string;
    transactionId?: string;
    gatewayResponse?: Prisma.InputJsonValue;
  }) {
    return prisma.payment.create({
      data: {
        invoiceId: data.invoiceId,
        gateway: data.gateway,
        amount: data.amount,
        currency: data.currency,
        transactionId: data.transactionId,
        gatewayResponse: data.gatewayResponse,
        status: 'PENDING',
      },
    });
  },

  // Update payment status
  async updatePaymentStatus(
    paymentId: string, 
    status: TransactionStatus, 
    gatewayResponse?: Prisma.InputJsonValue
  ) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        gatewayResponse,
        paidAt: status === 'SUCCESS' ? new Date() : undefined,
        updatedAt: new Date(),
      },
    });
  },

  // Mark invoice as paid
  async markInvoicePaid(invoiceId: string) {
    return prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });
  },

  // Activate service after payment
  async activateService(serviceId: string) {
    return prisma.service.update({
      where: { id: serviceId },
      data: {
        status: 'ACTIVE',
        registrationDate: new Date(),
      },
    });
  },

  // Get payment by transaction ID
  async getPaymentByTransactionId(transactionId: string) {
    return prisma.payment.findFirst({
      where: { transactionId },
      include: {
        invoice: {
          include: { user: true, service: true },
        },
      },
    });
  },

  // Create bank transfer record
  async createBankTransfer(data: {
    paymentId: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
  }) {
    const reference = this.generateBankReference();
    
    return prisma.bankTransfer.create({
      data: {
        paymentId: data.paymentId,
        bankName: data.bankName,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        reference,
        status: 'PENDING',
      },
    });
  },

  // Create crypto payment record
  async createCryptoPayment(data: {
    paymentId: string;
    cryptoCurrency: string;
    cryptoAmount: number;
    walletAddress: string;
    expiresAt: Date;
  }) {
    return prisma.cryptoPayment.create({
      data: {
        paymentId: data.paymentId,
        cryptoCurrency: data.cryptoCurrency,
        cryptoAmount: data.cryptoAmount,
        walletAddress: data.walletAddress,
        expiresAt: data.expiresAt,
        status: 'pending',
      },
    });
  },

  // Verify PayPal webhook signature
  verifyPayPalWebhook(headers: Record<string, string>): boolean {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) return true; // Skip verification if not configured

    const transmissionId = headers['paypal-transmission-id'];
    const timestamp = headers['paypal-transmission-time'];
    const transmissionSig = headers['paypal-transmission-sig'];

    return !!(transmissionId && timestamp && transmissionSig);
  },

  // Verify MercadoPago webhook
  verifyMercadoPagoWebhook(xSignature: string, dataId: string): boolean {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret) return true;

    const parts = xSignature.split(',');
    let ts = '';
    let hash = '';

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key.trim() === 'ts') ts = value.trim();
      if (key.trim() === 'v1') hash = value.trim();
    }

    const manifest = `id:${dataId};request-id:;ts:${ts};`;
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    return hash === expectedHash;
  },

  // Get pending bank transfers
  async getPendingBankTransfers() {
    return prisma.bankTransfer.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        payment: {
          include: { invoice: { include: { user: true } } },
        },
      },
    });
  },

  // Confirm bank transfer
  async confirmBankTransfer(
    paymentId: string,
    adminId: string,
    notes?: string
  ) {
    const transfer = await prisma.bankTransfer.findUnique({
      where: { paymentId },
    });

    if (!transfer) {
      throw new Error('Transfer not found');
    }

    // Update transfer status
    await prisma.bankTransfer.update({
      where: { id: transfer.id },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: adminId,
        notes,
      },
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'SUCCESS', paidAt: new Date() },
    });

    // Get payment and mark invoice as paid
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });

    if (payment?.invoice) {
      await this.markInvoicePaid(payment.invoice.id);
      
      if (payment.invoice.serviceId) {
        await this.activateService(payment.invoice.serviceId);
      }
    }

    return transfer;
  },
};

export default PaymentService;
