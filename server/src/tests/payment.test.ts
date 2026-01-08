import { describe, it, expect } from 'vitest';
import { PaymentService } from '../services/payment.service.js';

describe('Payment Service', () => {
  describe('generateBankReference', () => {
    it('should generate a valid bank reference', () => {
      const reference = PaymentService.generateBankReference();
      
      expect(reference).toBeDefined();
      expect(reference).toMatch(/^SPX-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    it('should generate unique references', () => {
      const reference1 = PaymentService.generateBankReference();
      const reference2 = PaymentService.generateBankReference();
      
      expect(reference1).not.toBe(reference2);
    });
  });

  describe('generateTransactionId', () => {
    it('should generate a valid transaction ID', () => {
      const transactionId = PaymentService.generateTransactionId();
      
      expect(transactionId).toBeDefined();
      expect(transactionId).toMatch(/^TXN-\d+-[a-f0-9]+$/);
    });

    it('should generate unique transaction IDs', () => {
      const id1 = PaymentService.generateTransactionId();
      const id2 = PaymentService.generateTransactionId();
      
      expect(id1).not.toBe(id2);
    });
  });
});
