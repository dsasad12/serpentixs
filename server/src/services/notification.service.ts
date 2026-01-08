import { PrismaClient, InvoiceStatus } from '@prisma/client';
import { emailService } from './email.service.js';

const prisma = new PrismaClient();

// ============================================
// NOTIFICATION SERVICE
// ============================================

export interface NotificationData {
  userId: string;
  type: 'invoice_due' | 'invoice_overdue' | 'service_suspended' | 'service_renewed' | 'payment_received' | 'ticket_reply' | 'system';
  title: string;
  message: string;
  link?: string;
  sendEmail?: boolean;
}

export const NotificationService = {
  // Create notification in database
  async create(data: NotificationData) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.link ? { link: data.link } : undefined,
        isRead: false,
      },
    });

    return notification;
  },

  // Send invoice due reminder
  async sendInvoiceDueReminder(invoiceId: string, daysUntilDue: number) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { 
        user: true, 
        service: true,
      },
    });

    if (!invoice) return;

    const title = `Factura ${invoice.invoiceNumber} vence en ${daysUntilDue} día${daysUntilDue > 1 ? 's' : ''}`;
    const message = `Tu factura por ${invoice.currency} ${invoice.total} vencerá pronto. Realiza el pago para evitar interrupciones.`;

    // Create in-app notification
    await this.create({
      userId: invoice.userId,
      type: 'invoice_due',
      title,
      message,
      link: `/invoices/${invoice.id}`,
    });

    // Send email
    try {
      await emailService.sendTemplateEmail(invoice.user.email, 'invoice_reminder', {
        firstName: invoice.user.firstName,
        invoiceNumber: invoice.invoiceNumber,
        amount: `${invoice.currency} ${invoice.total}`,
        dueDate: invoice.dueDate.toLocaleDateString('es-ES'),
        daysUntilDue: daysUntilDue,
        serviceName: invoice.service?.name || 'Servicio',
        paymentLink: `${process.env.APP_URL}/invoices/${invoice.id}/pay`,
      });
    } catch (error) {
      console.error('Error sending invoice reminder email:', error);
    }
  },

  // Send invoice overdue notification
  async sendInvoiceOverdueNotification(invoiceId: string, daysPastDue: number) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { 
        user: true, 
        service: true,
      },
    });

    if (!invoice) return;

    const title = `Factura ${invoice.invoiceNumber} vencida`;
    const message = `Tu factura está vencida hace ${daysPastDue} día${daysPastDue > 1 ? 's' : ''}. Paga ahora para evitar la suspensión de tu servicio.`;

    // Create in-app notification
    await this.create({
      userId: invoice.userId,
      type: 'invoice_overdue',
      title,
      message,
      link: `/invoices/${invoice.id}`,
    });

    // Send email
    try {
      await emailService.sendTemplateEmail(invoice.user.email, 'invoice_overdue', {
        firstName: invoice.user.firstName,
        invoiceNumber: invoice.invoiceNumber,
        amount: `${invoice.currency} ${invoice.total}`,
        dueDate: invoice.dueDate.toLocaleDateString('es-ES'),
        daysPastDue: daysPastDue,
        serviceName: invoice.service?.name || 'Servicio',
        paymentLink: `${process.env.APP_URL}/invoices/${invoice.id}/pay`,
      });
    } catch (error) {
      console.error('Error sending overdue notification email:', error);
    }
  },

  // Send service suspended notification
  async sendServiceSuspendedNotification(serviceId: string, reason: string) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { user: true },
    });

    if (!service) return;

    const title = `Servicio ${service.name} suspendido`;
    const message = `Tu servicio ha sido suspendido por: ${reason}. Realiza el pago pendiente para reactivarlo.`;

    // Create in-app notification
    await this.create({
      userId: service.userId,
      type: 'service_suspended',
      title,
      message,
      link: `/services/${service.id}`,
    });

    // Send email
    try {
      await emailService.sendTemplateEmail(service.user.email, 'service_suspended', {
        firstName: service.user.firstName,
        serviceName: service.name,
        reason,
        supportLink: `${process.env.APP_URL}/support`,
      });
    } catch (error) {
      console.error('Error sending suspension notification email:', error);
    }
  },

  // Send payment received notification
  async sendPaymentReceivedNotification(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { 
        invoice: {
          include: { user: true, service: true },
        },
      },
    });

    if (!payment || !payment.invoice) return;

    const invoice = payment.invoice;
    const title = 'Pago recibido';
    const message = `Hemos recibido tu pago de ${invoice.currency} ${invoice.total} para la factura ${invoice.invoiceNumber}.`;

    // Create in-app notification
    await this.create({
      userId: invoice.userId,
      type: 'payment_received',
      title,
      message,
      link: `/invoices/${invoice.id}`,
    });

    // Send email
    try {
      await emailService.sendTemplateEmail(invoice.user.email, 'payment_confirmation', {
        firstName: invoice.user.firstName,
        invoiceNumber: invoice.invoiceNumber,
        amount: `${invoice.currency} ${invoice.total}`,
        serviceName: invoice.service?.name || 'Servicio',
        paymentMethod: payment.gateway,
        transactionId: payment.transactionId || payment.id,
      });
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
    }
  },

  // Send ticket reply notification
  async sendTicketReplyNotification(ticketId: string, replyId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { user: true },
    });

    const reply = await prisma.ticketReply.findUnique({
      where: { id: replyId },
      include: { user: true },
    });

    if (!ticket || !reply) return;

    // Don't notify if user replied to their own ticket
    if (reply.userId === ticket.userId) return;

    const title = `Nueva respuesta en ticket #${ticket.ticketNumber}`;
    const message = `${reply.user.firstName} ha respondido a tu ticket: "${ticket.subject}"`;

    // Create in-app notification
    await this.create({
      userId: ticket.userId,
      type: 'ticket_reply',
      title,
      message,
      link: `/tickets/${ticket.id}`,
    });

    // Send email
    try {
      await emailService.sendTemplateEmail(ticket.user.email, 'ticket_reply', {
        firstName: ticket.user.firstName,
        ticketNumber: ticket.ticketNumber,
        ticketSubject: ticket.subject,
        replyFrom: `${reply.user.firstName} ${reply.user.lastName}`,
        replyPreview: reply.message.substring(0, 200) + (reply.message.length > 200 ? '...' : ''),
        ticketLink: `${process.env.APP_URL}/tickets/${ticket.id}`,
      });
    } catch (error) {
      console.error('Error sending ticket reply notification email:', error);
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  // Get unread count
  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  // Get user notifications
  async getUserNotifications(userId: string, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  // Process pending reminders (called by cron)
  async processPendingReminders() {
    const now = new Date();
    const reminderDays = [7, 3, 1]; // Days before due date to send reminders

    for (const days of reminderDays) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      
      // Find invoices due on this date that haven't been reminded
      const invoices = await prisma.invoice.findMany({
        where: {
          status: InvoiceStatus.UNPAID,
          dueDate: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lt: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
        },
        include: { user: true },
      });

      for (const invoice of invoices) {
        // Check if we already sent a reminder for this day
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: invoice.userId,
            type: 'invoice_due',
            title: { contains: invoice.invoiceNumber },
            createdAt: {
              gte: new Date(now.setHours(0, 0, 0, 0)),
            },
          },
        });

        if (!existingNotification) {
          await this.sendInvoiceDueReminder(invoice.id, days);
          console.log(`Sent ${days}-day reminder for invoice ${invoice.invoiceNumber}`);
        }
      }
    }
  },
};
