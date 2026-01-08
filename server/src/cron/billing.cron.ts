import { PrismaClient, IntegrationType } from '@prisma/client';
import { PterodactylService, VirtualizorService, IntegrationService } from '../services/integration.service.js';
import { emailService } from '../services/email.service.js';

const prisma = new PrismaClient();

// ============================================
// CRON JOB: AUTO SUSPEND & TERMINATE SERVICES
// Run this script daily via cron
// ============================================

interface CronConfig {
  autoSuspendDays: number;
  autoTerminateDays: number;
  sendReminders: boolean;
  reminderDays: number[];
}

async function getConfig(): Promise<CronConfig> {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: ['auto_suspend_days', 'auto_terminate_days', 'reminder_days'],
      },
    },
  });

  const getValue = (key: string, defaultValue: string) =>
    settings.find((s: { key: string; value: string | null }) => s.key === key)?.value || defaultValue;

  return {
    autoSuspendDays: parseInt(getValue('auto_suspend_days', '3')),
    autoTerminateDays: parseInt(getValue('auto_terminate_days', '14')),
    sendReminders: true,
    reminderDays: getValue('reminder_days', '7,3,1')
      .split(',')
      .map((d: string) => parseInt(d.trim())),
  };
}

async function sendEmail(to: string, template: string, data: Record<string, string | number | boolean | undefined>) {
  // Usar el servicio de email real
  try {
    await emailService.sendTemplateEmail(to, template, data);
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error);
  }
}

async function getProvisionedServerWithIntegration(serviceId: string) {
  const provisionedServer = await prisma.provisionedServer.findFirst({
    where: { serviceId },
  });
  
  if (!provisionedServer) return null;
  
  // Obtener la integración correspondiente
  const integration = await prisma.integration.findFirst({
    where: { type: provisionedServer.integrationType },
  });
  
  return {
    ...provisionedServer,
    integration,
  };
}

async function suspendService(serviceId: string) {
  const server = await getProvisionedServerWithIntegration(serviceId);

  if (server && server.integration) {
    try {
      switch (server.integrationType) {
        case 'PTERODACTYL':
          await PterodactylService.suspendServer(parseInt(server.externalId));
          break;
        case 'VIRTUALIZOR':
          await VirtualizorService.suspendVPS(parseInt(server.externalId));
          break;
        // Add more integrations as needed
      }

      await prisma.provisionedServer.update({
        where: { id: server.id },
        data: { status: 'SUSPENDED' },
      });
    } catch (error) {
      console.error(`Error suspending server for service ${serviceId}:`, error);
    }
  }

  // Update service status in database
  await prisma.service.update({
    where: { id: serviceId },
    data: {
      status: 'SUSPENDED',
      suspendReason: 'Falta de pago',
    },
  });
}

async function terminateService(serviceId: string) {
  const server = await getProvisionedServerWithIntegration(serviceId);

  if (server && server.integration) {
    try {
      switch (server.integrationType) {
        case 'PTERODACTYL':
          await PterodactylService.deleteServer(parseInt(server.externalId));
          break;
        case 'VIRTUALIZOR':
          await VirtualizorService.deleteVPS(parseInt(server.externalId));
          break;
        // Add more integrations as needed
      }

      await prisma.provisionedServer.delete({
        where: { id: server.id },
      });
    } catch (error) {
      console.error(`Error terminating server for service ${serviceId}:`, error);
    }
  }

  // Update service status in database
  await prisma.service.update({
    where: { id: serviceId },
    data: {
      status: 'TERMINATED',
      terminationDate: new Date(),
    },
  });
}

async function processOverdueInvoices() {
  console.log('\n🔄 Processing overdue invoices...');

  const config = await getConfig();
  const now = new Date();

  // Find unpaid/overdue invoices with related data
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: {
        in: ['UNPAID', 'OVERDUE'],
      },
      dueDate: {
        lt: now,
      },
    },
    include: {
      user: true,
      service: {
        include: {
          product: true,
        },
      },
    },
  });

  console.log(`Found ${overdueInvoices.length} overdue invoices`);

  for (const invoice of overdueInvoices) {
    const daysPastDue = Math.floor(
      (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    console.log(`Invoice ${invoice.invoiceNumber}: ${daysPastDue} days past due`);

    // Mark as overdue if not already
    if (invoice.status !== 'OVERDUE') {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE' },
      });
    }

    const service = invoice.service;
    const user = invoice.user;

    if (service) {
      // Check if service should be suspended
      if (
        daysPastDue >= config.autoSuspendDays &&
        service.status === 'ACTIVE'
      ) {
        console.log(`Suspending service: ${service.name}`);
        await suspendService(service.id);

        // Send notification
        await sendEmail(user.email, 'service_suspended', {
          firstName: user.firstName,
          serviceName: service.name,
          invoiceNumber: invoice.invoiceNumber,
        });

        // Create notification in database
        await prisma.notification.create({
          data: {
            userId: invoice.userId,
            type: 'service_suspended',
            title: 'Servicio Suspendido',
            message: `Tu servicio ${service.name} ha sido suspendido por falta de pago.`,
            data: {
              serviceId: service.id,
              invoiceId: invoice.id,
            },
          },
        });
      }

      // Check if service should be terminated
      if (
        daysPastDue >= config.autoTerminateDays &&
        service.status === 'SUSPENDED'
      ) {
        console.log(`Terminating service: ${service.name}`);
        await terminateService(service.id);

        // Send notification
        await sendEmail(user.email, 'service_terminated', {
          firstName: user.firstName,
          serviceName: service.name,
        });

        // Create notification in database
        await prisma.notification.create({
          data: {
            userId: invoice.userId,
            type: 'service_terminated',
            title: 'Servicio Terminado',
            message: `Tu servicio ${service.name} ha sido terminado por falta de pago.`,
            data: {
              serviceId: service.id,
            },
          },
        });
      }
    }
  }
}

async function sendPaymentReminders() {
  console.log('\n📬 Sending payment reminders...');

  const config = await getConfig();
  const now = new Date();

  for (const days of config.reminderDays) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + days);

    // Find invoices due in X days
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const invoices = await prisma.invoice.findMany({
      where: {
        status: 'UNPAID',
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        user: true,
        service: true,
      },
    });

    console.log(`Found ${invoices.length} invoices due in ${days} days`);

    for (const invoice of invoices) {
      const user = invoice.user;
      
      // Send reminder email
      await sendEmail(user.email, 'payment_reminder', {
        firstName: user.firstName,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total.toString(),
        currency: invoice.currency,
        dueDate: invoice.dueDate.toLocaleDateString('es-ES'),
        daysUntilDue: days,
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: invoice.userId,
          type: 'payment_reminder',
          title: `Recordatorio de Pago - ${days} días`,
          message: `Tu factura #${invoice.invoiceNumber} vence en ${days} días.`,
          data: {
            invoiceId: invoice.id,
            dueDate: invoice.dueDate.toISOString(),
          },
        },
      });
    }
  }
}

async function generateRenewalInvoices() {
  console.log('\n📝 Generating renewal invoices...');

  const now = new Date();
  const daysAhead = 7; // Generate invoices 7 days before due

  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysAhead);

  // Find services due for renewal
  const services = await prisma.service.findMany({
    where: {
      status: 'ACTIVE',
      nextDueDate: {
        lte: targetDate,
      },
    },
    include: {
      user: true,
      product: true,
    },
  });

  console.log(`Found ${services.length} services due for renewal`);

  for (const service of services) {
    // Check if invoice already exists for this period
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        serviceId: service.id,
        status: {
          in: ['UNPAID', 'DRAFT'],
        },
        dueDate: {
          gte: service.nextDueDate!,
        },
      },
    });

    if (!existingInvoice) {
      // Generate invoice number
      const lastInvoice = await prisma.invoice.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

      // Create renewal invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          userId: service.userId,
          serviceId: service.id,
          status: 'UNPAID',
          subtotal: service.price,
          total: service.price,
          currency: 'USD',
          dueDate: service.nextDueDate!,
          items: {
            create: [
              {
                description: `Renovación: ${service.name}`,
                quantity: 1,
                unitPrice: service.price,
                total: service.price,
              },
            ],
          },
        },
      });

      console.log(`Created invoice ${invoiceNumber} for service ${service.name}`);

      // Send invoice notification
      await sendEmail(service.user.email, 'invoice_created', {
        firstName: service.user.firstName,
        invoiceNumber,
        total: Number(service.price),
        currency: 'USD',
        dueDate: service.nextDueDate!.toLocaleDateString('es-ES'),
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: service.userId,
          type: 'invoice_created',
          title: 'Nueva Factura',
          message: `Se ha generado la factura #${invoiceNumber} por la renovación de ${service.name}.`,
          data: {
            invoiceId: invoice.id,
            serviceId: service.id,
          },
        },
      });
    }
  }
}

async function expirePendingBankTransfers() {
  console.log('\n⏰ Expiring old bank transfers...');

  const expirationHours = 48;
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() - expirationHours);

  const expiredTransfers = await prisma.bankTransfer.updateMany({
    where: {
      status: 'PENDING',
      createdAt: {
        lt: expirationDate,
      },
    },
    data: {
      status: 'EXPIRED',
    },
  });

  console.log(`Expired ${expiredTransfers.count} bank transfers`);
}

async function expireCryptoPayments() {
  console.log('\n⏰ Expiring old crypto payments...');

  const now = new Date();

  const expiredPayments = await prisma.cryptoPayment.updateMany({
    where: {
      status: 'pending',
      expiresAt: {
        lt: now,
      },
    },
    data: {
      status: 'expired',
    },
  });

  console.log(`Expired ${expiredPayments.count} crypto payments`);
}

async function cleanOldNotifications() {
  console.log('\n🧹 Cleaning old notifications...');

  const retentionDays = 90;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const deleted = await prisma.notification.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
      isRead: true,
    },
  });

  console.log(`Deleted ${deleted.count} old notifications`);
}

// Main function
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SerpentixPay - Cron Jobs');
  console.log('  Time:', new Date().toISOString());
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Process invoices and services
    await processOverdueInvoices();
    await sendPaymentReminders();
    await generateRenewalInvoices();

    // Expire old payments
    await expirePendingBankTransfers();
    await expireCryptoPayments();

    // Cleanup
    await cleanOldNotifications();

    console.log('\n✅ All cron jobs completed successfully!');
  } catch (error) {
    console.error('\n❌ Error in cron jobs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
