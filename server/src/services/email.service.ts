import nodemailer, { Transporter } from 'nodemailer';
import { prisma } from '../lib/prisma.js';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  fromName: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface TemplateVariables {
  [key: string]: string | number | boolean | undefined;
}

class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig;
  private initialized: boolean = false;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
      from: process.env.SMTP_FROM || 'noreply@serpentixpay.com',
      fromName: process.env.SMTP_FROM_NAME || 'SerpentixPay',
    };
  }

  private async initialize(): Promise<boolean> {
    if (this.initialized && this.transporter) {
      return true;
    }

    if (!this.config.auth.user || !this.config.auth.pass) {
      console.warn('⚠️ Email service not configured: SMTP credentials missing');
      return false;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.auth.user,
          pass: this.config.auth.pass,
        },
      });

      // Verify connection
      await this.transporter.verify();
      this.initialized = true;
      console.log('✅ Email service initialized');
      return true;
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
      this.transporter = null;
      return false;
    }
  }

  private async logEmail(
    to: string,
    subject: string,
    templateId: string | null,
    status: 'PENDING' | 'SENT' | 'FAILED',
    error?: string
  ): Promise<void> {
    try {
      await prisma.emailLog.create({
        data: {
          to,
          subject,
          templateId,
          status,
          sentAt: status === 'SENT' ? new Date() : null,
          error,
        },
      });
    } catch (err) {
      console.error('Failed to log email:', err);
    }
  }

  private replaceVariables(content: string, variables: TemplateVariables): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value ?? ''));
    }
    return result;
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    const isConfigured = await this.initialize();

    if (!isConfigured || !this.transporter) {
      console.log(`📧 [DEV] Email to ${data.to}: ${data.subject}`);
      console.log(`   Content preview: ${data.html.substring(0, 100)}...`);
      await this.logEmail(data.to, data.subject, null, 'PENDING', 'Email service not configured');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.from}>`,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text || data.html.replace(/<[^>]*>/g, ''),
      });

      await this.logEmail(data.to, data.subject, null, 'SENT');
      console.log(`✉️ Email sent to ${data.to}: ${data.subject}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logEmail(data.to, data.subject, null, 'FAILED', errorMessage);
      console.error(`❌ Failed to send email to ${data.to}:`, errorMessage);
      return false;
    }
  }

  async sendTemplateEmail(
    to: string,
    templateName: string,
    variables: TemplateVariables
  ): Promise<boolean> {
    try {
      // Get template from database
      const template = await prisma.emailTemplate.findUnique({
        where: { name: templateName },
      });

      if (!template) {
        console.error(`❌ Email template not found: ${templateName}`);
        return false;
      }

      if (!template.isActive) {
        console.warn(`⚠️ Email template disabled: ${templateName}`);
        return false;
      }

      // Replace variables in subject and content
      const subject = this.replaceVariables(template.subject, variables);
      const html = this.replaceVariables(template.htmlContent, variables);
      const text = template.textContent 
        ? this.replaceVariables(template.textContent, variables)
        : undefined;

      const result = await this.sendEmail({ to, subject, html, text });

      // Log with template reference
      if (result) {
        await prisma.emailLog.updateMany({
          where: {
            to,
            subject,
            createdAt: {
              gte: new Date(Date.now() - 5000), // Within last 5 seconds
            },
          },
          data: { templateId: template.id },
        });
      }

      return result;
    } catch (error) {
      console.error(`❌ Failed to send template email:`, error);
      return false;
    }
  }

  // Convenience methods for common email types
  async sendWelcomeEmail(user: { email: string; firstName: string; lastName: string }): Promise<boolean> {
    return this.sendTemplateEmail(user.email, 'welcome', {
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      company_name: this.config.fromName,
    });
  }

  async sendInvoiceCreatedEmail(
    user: { email: string; firstName: string },
    invoice: { number: string; total: number; currency: string; dueDate: Date }
  ): Promise<boolean> {
    return this.sendTemplateEmail(user.email, 'invoice_created', {
      first_name: user.firstName,
      invoice_number: invoice.number,
      total: invoice.total.toFixed(2),
      currency: invoice.currency,
      due_date: invoice.dueDate.toLocaleDateString('es-ES'),
    });
  }

  async sendPaymentReceivedEmail(
    user: { email: string; firstName: string },
    payment: { invoiceNumber: string; amount: number; currency: string }
  ): Promise<boolean> {
    return this.sendTemplateEmail(user.email, 'payment_received', {
      first_name: user.firstName,
      invoice_number: payment.invoiceNumber,
      amount: payment.amount.toFixed(2),
      currency: payment.currency,
    });
  }

  async sendPasswordResetEmail(
    user: { email: string; firstName: string },
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    return this.sendTemplateEmail(user.email, 'password_reset', {
      first_name: user.firstName,
      reset_url: resetUrl,
      company_name: this.config.fromName,
    });
  }

  async sendServiceSuspendedEmail(
    user: { email: string; firstName: string },
    service: { name: string; reason: string }
  ): Promise<boolean> {
    return this.sendTemplateEmail(user.email, 'service_suspended', {
      first_name: user.firstName,
      service_name: service.name,
      suspend_reason: service.reason,
      company_name: this.config.fromName,
    });
  }

  async sendServiceTerminatedEmail(
    user: { email: string; firstName: string },
    service: { name: string }
  ): Promise<boolean> {
    return this.sendTemplateEmail(user.email, 'service_terminated', {
      first_name: user.firstName,
      service_name: service.name,
      company_name: this.config.fromName,
    });
  }

  async sendPaymentReminderEmail(
    user: { email: string; firstName: string },
    invoice: { number: string; total: number; currency: string; dueDate: Date; daysOverdue: number }
  ): Promise<boolean> {
    return this.sendTemplateEmail(user.email, 'payment_reminder', {
      first_name: user.firstName,
      invoice_number: invoice.number,
      total: invoice.total.toFixed(2),
      currency: invoice.currency,
      due_date: invoice.dueDate.toLocaleDateString('es-ES'),
      days_overdue: invoice.daysOverdue,
    });
  }

  async sendTicketCreatedEmail(
    user: { email: string; firstName: string },
    ticket: { number: string; subject: string; department: string }
  ): Promise<boolean> {
    return this.sendTemplateEmail(user.email, 'ticket_created', {
      first_name: user.firstName,
      ticket_number: ticket.number,
      ticket_subject: ticket.subject,
      department: ticket.department,
      company_name: this.config.fromName,
    });
  }

  async sendTicketReplyEmail(
    user: { email: string; firstName: string },
    ticket: { number: string; subject: string },
    isStaffReply: boolean
  ): Promise<boolean> {
    const templateName = isStaffReply ? 'ticket_staff_reply' : 'ticket_customer_reply';
    return this.sendTemplateEmail(user.email, templateName, {
      first_name: user.firstName,
      ticket_number: ticket.number,
      ticket_subject: ticket.subject,
      company_name: this.config.fromName,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
