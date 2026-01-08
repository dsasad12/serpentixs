import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // Crear Super Admin
  const superAdminPassword = await bcrypt.hash('Admin123!', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@serpentixs.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'admin@serpentixs.com',
      password: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      emailVerified: true,
    },
  });
  console.log('✅ Super Admin creado:', superAdmin.email);

  // Crear usuario administrador
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'soporte@serpentixs.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'soporte@serpentixs.com',
      password: adminPassword,
      firstName: 'Soporte',
      lastName: 'Serpentixs',
      role: 'SUPPORT',
      emailVerified: true,
    },
  });
  console.log('✅ Usuario soporte creado:', admin.email);

  // Crear usuario cliente de demo
  const demoPassword = await bcrypt.hash('Cliente123!', 12);
  const demo = await prisma.user.upsert({
    where: { email: 'cliente@test.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'cliente@test.com',
      password: demoPassword,
      firstName: 'Cliente',
      lastName: 'Demo',
      role: 'CLIENT',
      emailVerified: true,
    },
  });
  console.log('✅ Usuario cliente creado:', demo.email);

  // Crear categorías
  const categories = [
    {
      name: 'Game Hosting',
      slug: 'game-hosting',
      description: 'Servidores de juegos optimizados para el mejor rendimiento',
      icon: 'gamepad',
      order: 1,
    },
    {
      name: 'Web Hosting',
      slug: 'web-hosting',
      description: 'Alojamiento web con cPanel y SSL gratuito',
      icon: 'globe',
      order: 2,
    },
    {
      name: 'VPS',
      slug: 'vps',
      description: 'Servidores virtuales privados con recursos dedicados',
      icon: 'server',
      order: 3,
    },
    {
      name: 'Servidores Dedicados',
      slug: 'dedicated-servers',
      description: 'Servidores físicos de alto rendimiento',
      icon: 'database',
      order: 4,
    },
    {
      name: 'Dominios',
      slug: 'domains',
      description: 'Registro y transferencia de dominios',
      icon: 'at-sign',
      order: 5,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: { id: uuidv4(), ...cat },
    });
  }
  console.log('✅ Categorías creadas');

  // Obtener categorías
  const gameHosting = await prisma.category.findUnique({ where: { slug: 'game-hosting' } });
  const webHosting = await prisma.category.findUnique({ where: { slug: 'web-hosting' } });
  const vps = await prisma.category.findUnique({ where: { slug: 'vps' } });

  // Crear productos de ejemplo
  if (gameHosting) {
    const minecraftProduct = await prisma.product.upsert({
      where: { slug: 'minecraft-server' },
      update: {},
      create: {
        id: uuidv4(),
        categoryId: gameHosting.id,
        name: 'Minecraft Server',
        slug: 'minecraft-server',
        description: 'Servidor de Minecraft con mod support completo',
        shortDescription: 'Servidor optimizado para Minecraft Java & Bedrock',
        features: JSON.stringify([
          'Panel de control intuitivo',
          'Instalador de mods con 1 click',
          'Backups automáticos',
          'Soporte 24/7',
          'DDoS Protection',
        ]),
        isActive: true,
      },
    });

    // Precios para Minecraft
    await prisma.productPricing.upsert({
      where: { productId_billingCycle: { productId: minecraftProduct.id, billingCycle: 'MONTHLY' } },
      update: {},
      create: {
        id: uuidv4(),
        productId: minecraftProduct.id,
        billingCycle: 'MONTHLY',
        price: 9.99,
        setupFee: 0,
      },
    });
  }

  if (webHosting) {
    const webBasicProduct = await prisma.product.upsert({
      where: { slug: 'web-basic' },
      update: {},
      create: {
        id: uuidv4(),
        categoryId: webHosting.id,
        name: 'Web Hosting Básico',
        slug: 'web-basic',
        description: 'Plan perfecto para sitios web pequeños y blogs',
        shortDescription: '10GB SSD, SSL Gratis, cPanel incluido',
        features: JSON.stringify([
          '10GB SSD Storage',
          '100GB Bandwidth',
          'cPanel incluido',
          'SSL Gratis',
          'Email ilimitado',
        ]),
        isActive: true,
      },
    });

    await prisma.productPricing.upsert({
      where: { productId_billingCycle: { productId: webBasicProduct.id, billingCycle: 'MONTHLY' } },
      update: {},
      create: {
        id: uuidv4(),
        productId: webBasicProduct.id,
        billingCycle: 'MONTHLY',
        price: 4.99,
        setupFee: 0,
      },
    });
  }

  if (vps) {
    const vpsBasicProduct = await prisma.product.upsert({
      where: { slug: 'vps-basic' },
      update: {},
      create: {
        id: uuidv4(),
        categoryId: vps.id,
        name: 'VPS Basic',
        slug: 'vps-basic',
        description: 'VPS de entrada con excelente rendimiento',
        shortDescription: '2 vCPU, 2GB RAM, 50GB NVMe',
        features: JSON.stringify([
          '2 vCPU Cores',
          '2GB RAM DDR4',
          '50GB NVMe SSD',
          '2TB Bandwidth',
          'Full root access',
        ]),
        isActive: true,
      },
    });

    await prisma.productPricing.upsert({
      where: { productId_billingCycle: { productId: vpsBasicProduct.id, billingCycle: 'MONTHLY' } },
      update: {},
      create: {
        id: uuidv4(),
        productId: vpsBasicProduct.id,
        billingCycle: 'MONTHLY',
        price: 12.99,
        setupFee: 0,
      },
    });
  }
  console.log('✅ Productos de ejemplo creados');

  // Crear configuraciones por defecto
  const settings = [
    { group: 'general', key: 'app_name', value: 'SerpentixPay', type: 'string' },
    { group: 'general', key: 'company_name', value: 'Mi Empresa Hosting', type: 'string' },
    { group: 'general', key: 'company_email', value: 'contacto@example.com', type: 'string' },
    { group: 'general', key: 'timezone', value: 'America/Mexico_City', type: 'string' },
    { group: 'billing', key: 'currency', value: 'USD', type: 'string' },
    { group: 'billing', key: 'currency_symbol', value: '$', type: 'string' },
    { group: 'billing', key: 'tax_enabled', value: 'true', type: 'boolean' },
    { group: 'billing', key: 'tax_rate', value: '16', type: 'number' },
    { group: 'billing', key: 'invoice_prefix', value: 'INV-', type: 'string' },
    { group: 'theme', key: 'primary_color', value: '6366f1', type: 'string' },
    { group: 'theme', key: 'accent_color', value: 'd946ef', type: 'string' },
    { group: 'theme', key: 'dark_mode', value: 'true', type: 'boolean' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { group: setting.group, value: setting.value, type: setting.type },
      create: { id: uuidv4(), ...setting },
    });
  }
  console.log('✅ Configuraciones por defecto creadas');

  // Crear métodos de pago
  const paymentMethods = [
    { name: 'stripe', gateway: 'STRIPE' as const, displayName: 'Stripe', icon: 'credit-card', order: 1, isActive: true },
    { name: 'paypal', gateway: 'PAYPAL' as const, displayName: 'PayPal', icon: 'paypal', order: 2, isActive: true },
    { name: 'mercadopago', gateway: 'MERCADOPAGO' as const, displayName: 'MercadoPago', icon: 'dollar-sign', order: 3, isActive: true },
    { name: 'bank_transfer', gateway: 'BANK_TRANSFER' as const, displayName: 'Transferencia Bancaria', icon: 'building', order: 4, isActive: true },
  ];

  for (const method of paymentMethods) {
    const existingMethod = await prisma.paymentMethod.findFirst({ where: { name: method.name } });
    if (!existingMethod) {
      await prisma.paymentMethod.create({
        data: { id: uuidv4(), ...method },
      });
    }
  }
  console.log('✅ Métodos de pago creados');

  // Crear plantillas de email
  const emailTemplates = [
    {
      name: 'welcome',
      subject: '¡Bienvenido a {{company_name}}!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8B5CF6;">¡Bienvenido, {{first_name}}!</h1>
          <p>Gracias por registrarte en {{company_name}}.</p>
          <p>Tu cuenta ha sido creada exitosamente.</p>
          <p style="margin-top: 20px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">© {{company_name}}</p>
        </div>
      `,
      variables: JSON.stringify(['first_name', 'last_name', 'email', 'company_name']),
    },
    {
      name: 'invoice_created',
      subject: 'Nueva factura #{{invoice_number}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8B5CF6;">Nueva Factura</h1>
          <p>Hola {{first_name}},</p>
          <p>Se ha generado una nueva factura por <strong>\${{total}} {{currency}}</strong>.</p>
          <p>Fecha de vencimiento: <strong>{{due_date}}</strong></p>
          <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0;"><strong>Factura:</strong> #{{invoice_number}}</p>
            <p style="margin: 5px 0 0;"><strong>Total:</strong> \${{total}} {{currency}}</p>
          </div>
          <a href="{{invoice_url}}" style="display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px;">Ver Factura</a>
        </div>
      `,
      variables: JSON.stringify(['first_name', 'invoice_number', 'total', 'currency', 'due_date', 'invoice_url']),
    },
    {
      name: 'payment_received',
      subject: 'Pago recibido - Factura #{{invoice_number}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10B981;">¡Pago Recibido!</h1>
          <p>Hola {{first_name}},</p>
          <p>Hemos recibido tu pago de <strong>\${{amount}} {{currency}}</strong> para la factura #{{invoice_number}}.</p>
          <p>¡Gracias por tu preferencia!</p>
        </div>
      `,
      variables: JSON.stringify(['first_name', 'invoice_number', 'amount', 'currency']),
    },
    {
      name: 'payment_reminder',
      subject: 'Recordatorio de pago - Factura #{{invoice_number}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #F59E0B;">Recordatorio de Pago</h1>
          <p>Hola {{first_name}},</p>
          <p>Te recordamos que tienes una factura pendiente de pago.</p>
          <div style="margin: 20px 0; padding: 15px; background: #FEF3C7; border-radius: 8px;">
            <p style="margin: 0;"><strong>Factura:</strong> #{{invoice_number}}</p>
            <p style="margin: 5px 0 0;"><strong>Total:</strong> \${{total}} {{currency}}</p>
            <p style="margin: 5px 0 0;"><strong>Vencimiento:</strong> {{due_date}}</p>
            <p style="margin: 5px 0 0; color: #DC2626;"><strong>Días vencidos:</strong> {{days_overdue}}</p>
          </div>
          <a href="{{pay_url}}" style="display: inline-block; padding: 12px 24px; background: #F59E0B; color: white; text-decoration: none; border-radius: 6px;">Pagar Ahora</a>
        </div>
      `,
      variables: JSON.stringify(['first_name', 'invoice_number', 'total', 'currency', 'due_date', 'days_overdue', 'pay_url']),
    },
    {
      name: 'service_suspended',
      subject: 'Servicio suspendido - {{service_name}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #DC2626;">Servicio Suspendido</h1>
          <p>Hola {{first_name}},</p>
          <p>Tu servicio <strong>{{service_name}}</strong> ha sido suspendido.</p>
          <p><strong>Razón:</strong> {{suspend_reason}}</p>
          <p>Para reactivar tu servicio, por favor realiza el pago pendiente.</p>
          <a href="{{billing_url}}" style="display: inline-block; padding: 12px 24px; background: #DC2626; color: white; text-decoration: none; border-radius: 6px;">Ver Facturas</a>
        </div>
      `,
      variables: JSON.stringify(['first_name', 'service_name', 'suspend_reason', 'billing_url']),
    },
    {
      name: 'service_terminated',
      subject: 'Servicio terminado - {{service_name}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #DC2626;">Servicio Terminado</h1>
          <p>Hola {{first_name}},</p>
          <p>Lamentamos informarte que tu servicio <strong>{{service_name}}</strong> ha sido terminado debido a falta de pago.</p>
          <p>Si deseas volver a contratar nuestros servicios, por favor visita nuestra tienda.</p>
        </div>
      `,
      variables: JSON.stringify(['first_name', 'service_name', 'company_name']),
    },
    {
      name: 'ticket_created',
      subject: 'Ticket #{{ticket_number}} creado - {{ticket_subject}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8B5CF6;">Ticket Creado</h1>
          <p>Hola {{first_name}},</p>
          <p>Tu ticket de soporte ha sido creado exitosamente.</p>
          <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0;"><strong>Ticket:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0 0;"><strong>Asunto:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0 0;"><strong>Departamento:</strong> {{department}}</p>
          </div>
          <p>Te responderemos lo antes posible.</p>
        </div>
      `,
      variables: JSON.stringify(['first_name', 'ticket_number', 'ticket_subject', 'department', 'company_name']),
    },
    {
      name: 'ticket_staff_reply',
      subject: 'Nueva respuesta en Ticket #{{ticket_number}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8B5CF6;">Nueva Respuesta</h1>
          <p>Hola {{first_name}},</p>
          <p>Hemos respondido a tu ticket de soporte.</p>
          <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0;"><strong>Ticket:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0 0;"><strong>Asunto:</strong> {{ticket_subject}}</p>
          </div>
          <a href="{{ticket_url}}" style="display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px;">Ver Respuesta</a>
        </div>
      `,
      variables: JSON.stringify(['first_name', 'ticket_number', 'ticket_subject', 'ticket_url', 'company_name']),
    },
    {
      name: 'password_reset',
      subject: 'Restablecer contraseña - {{company_name}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8B5CF6;">Restablecer Contraseña</h1>
          <p>Hola {{first_name}},</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <a href="{{reset_url}}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px;">Restablecer Contraseña</a>
          <p style="color: #666;">Si no solicitaste este cambio, puedes ignorar este email.</p>
          <p style="color: #666;">Este enlace expira en 1 hora.</p>
        </div>
      `,
      variables: JSON.stringify(['first_name', 'reset_url', 'company_name']),
    },
  ];

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { name: template.name },
      update: { subject: template.subject, htmlContent: template.htmlContent, variables: template.variables },
      create: { id: uuidv4(), ...template },
    });
  }
  console.log('✅ Plantillas de email creadas');

  // Crear departamentos de soporte
  const departments = [
    { name: 'Soporte Técnico', description: 'Ayuda con problemas técnicos y servidores', order: 1 },
    { name: 'Facturación', description: 'Consultas sobre pagos y facturas', order: 2 },
    { name: 'Ventas', description: 'Información sobre productos y planes', order: 3 },
    { name: 'Abuso', description: 'Reportar abuso o violaciones de TOS', order: 4 },
  ];

  for (const dept of departments) {
    const existing = await prisma.department.findFirst({ where: { name: dept.name } });
    if (!existing) {
      await prisma.department.create({
        data: { id: uuidv4(), ...dept, isActive: true },
      });
    }
  }
  console.log('✅ Departamentos de soporte creados');

  console.log('');
  console.log('🎉 Seed completado exitosamente!');
  console.log('');
  console.log('📧 Usuarios creados:');
  console.log('   - Admin: admin@serpentixs.com / Admin123!');
  console.log('   - Soporte: soporte@serpentixs.com / Admin123!');
  console.log('   - Cliente: cliente@test.com / Cliente123!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
