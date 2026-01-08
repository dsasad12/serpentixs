import { describe, it, expect } from 'vitest';

// Utility functions tests
describe('Utility Functions', () => {
  describe('Email Validation', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co')).toBe(true);
      expect(isValidEmail('user+tag@domain.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
    });
  });

  describe('Password Strength', () => {
    const isStrongPassword = (password: string): boolean => {
      // At least 8 characters, one uppercase, one lowercase, one number
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      return strongRegex.test(password);
    };

    it('should validate strong passwords', () => {
      expect(isStrongPassword('Test1234')).toBe(true);
      expect(isStrongPassword('MyP@ssw0rd')).toBe(true);
      expect(isStrongPassword('Secure123!')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(isStrongPassword('weak')).toBe(false);
      expect(isStrongPassword('12345678')).toBe(false);
      expect(isStrongPassword('password')).toBe(false);
      expect(isStrongPassword('UPPERCASE123')).toBe(false);
      expect(isStrongPassword('lowercase123')).toBe(false);
    });
  });

  describe('Currency Formatting', () => {
    const formatCurrency = (amount: number, currency: string): string => {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency,
      }).format(amount);
    };

    it('should format USD correctly', () => {
      const formatted = formatCurrency(100, 'USD');
      expect(formatted).toContain('100');
      // Format can be USD or $ depending on locale
      expect(formatted.includes('$') || formatted.includes('USD')).toBe(true);
    });

    it('should format EUR correctly', () => {
      const formatted = formatCurrency(50.99, 'EUR');
      expect(formatted).toContain('50');
      // Format can be EUR or € depending on locale
      expect(formatted.includes('€') || formatted.includes('EUR')).toBe(true);
    });

    it('should format MXN correctly', () => {
      const formatted = formatCurrency(1500, 'MXN');
      expect(formatted).toContain('1');
      expect(formatted).toContain('500');
    });
  });

  describe('Invoice Number Generation', () => {
    const generateInvoiceNumber = (): string => {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      return `INV-${year}-${random}`;
    };

    it('should generate valid invoice number format', () => {
      const invoiceNumber = generateInvoiceNumber();
      expect(invoiceNumber).toMatch(/^INV-\d{4}-\d{5}$/);
    });

    it('should include current year', () => {
      const invoiceNumber = generateInvoiceNumber();
      const currentYear = new Date().getFullYear().toString();
      expect(invoiceNumber).toContain(currentYear);
    });
  });

  describe('Date Utilities', () => {
    const addDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const isExpired = (dueDate: Date): boolean => {
      return new Date() > dueDate;
    };

    it('should add days correctly', () => {
      const today = new Date('2026-01-01');
      const future = addDays(today, 30);
      // Jan 1 + 30 days = Jan 31 (but Date handles timezone, so expect either 30 or 31)
      expect([30, 31]).toContain(future.getDate());
      expect(future.getMonth()).toBe(0); // January
    });

    it('should detect expired dates', () => {
      const pastDate = new Date('2020-01-01');
      const futureDate = new Date('2030-01-01');
      
      expect(isExpired(pastDate)).toBe(true);
      expect(isExpired(futureDate)).toBe(false);
    });
  });
});
