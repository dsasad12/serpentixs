import { Router, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { badRequest, notFound, validationError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authenticate);

// Get cart (stored in session/client)
// Orders are created from cart

// Create order
router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('Se requiere al menos un item'),
  body('items.*.productId').isUUID().withMessage('ID de producto inválido'),
  body('items.*.billingCycle').notEmpty().withMessage('Ciclo de facturación requerido'),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw validationError(errors.array());
    }

    const { items, couponCode } = req.body;

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          pricing: { where: { billingCycle: item.billingCycle, isActive: true } },
        },
      });

      if (!product || !product.isActive) {
        throw badRequest(`Producto no encontrado: ${item.productId}`);
      }

      const pricing = product.pricing[0];
      if (!pricing) {
        throw badRequest(`Precio no disponible para el ciclo seleccionado`);
      }

      const itemTotal = Number(pricing.price) + Number(pricing.setupFee);
      subtotal += itemTotal * (item.quantity || 1);

      orderItems.push({
        productId: product.id,
        name: product.name,
        description: product.shortDescription,
        billingCycle: item.billingCycle,
        price: pricing.price,
        setupFee: pricing.setupFee,
        quantity: item.quantity || 1,
        configOptions: item.configOptions || null,
      });
    }

    // Apply coupon
    let discount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const validDate = coupon.validFrom <= now &&
                         (!coupon.validUntil || coupon.validUntil >= now);
        const validUses = !coupon.maxUses || coupon.usedCount < coupon.maxUses;

        if (validDate && validUses) {
          if (coupon.type === 'PERCENTAGE') {
            discount = subtotal * (Number(coupon.value) / 100);
          } else if (coupon.type === 'FIXED') {
            discount = Math.min(Number(coupon.value), subtotal);
          }
        }
      }
    }

    // Calculate tax
    let tax = 0;
    if (config.billing.taxEnabled) {
      tax = (subtotal - discount) * (config.billing.taxRate / 100);
    }

    const total = subtotal - discount + tax;

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        id: uuidv4(),
        orderNumber,
        userId: req.user!.id,
        subtotal,
        discount,
        tax,
        total,
        currency: config.billing.currency,
        couponId: coupon?.id,
        ipAddress: req.ip,
        items: {
          create: orderItems.map(item => ({
            id: uuidv4(),
            ...item,
          })),
        },
      },
      include: {
        items: {
          include: { product: { select: { name: true, slug: true } } },
        },
      },
    });

    // Update coupon usage
    if (coupon) {
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Create invoice
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `${config.billing.invoicePrefix}${String(invoiceCount + 1).padStart(6, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        id: uuidv4(),
        invoiceNumber,
        userId: req.user!.id,
        orderId: order.id,
        subtotal,
        discount,
        tax,
        total,
        currency: config.billing.currency,
        dueDate: new Date(Date.now() + config.billing.invoiceDueDays * 24 * 60 * 60 * 1000),
        items: {
          create: orderItems.map(item => ({
            id: uuidv4(),
            description: `${item.name} (${item.billingCycle})`,
            quantity: item.quantity,
            unitPrice: Number(item.price) + Number(item.setupFee),
            total: (Number(item.price) + Number(item.setupFee)) * item.quantity,
          })),
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        order,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          total: invoice.total,
          dueDate: invoice.dueDate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get orders
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;

    const where: any = { userId: req.user!.id };
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: {
          items: { include: { product: { select: { name: true } } } },
          invoice: { select: { id: true, invoiceNumber: true, status: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single order
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      include: {
        items: { include: { product: true } },
        invoice: true,
        coupon: { select: { code: true, type: true, value: true } },
      },
    });

    if (!order) {
      throw notFound('Pedido no encontrado');
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
});

// Validate coupon
router.post('/validate-coupon', [
  body('code').trim().notEmpty().withMessage('Código requerido'),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw validationError(errors.array());
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: req.body.code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw notFound('Cupón no válido');
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      throw badRequest('El cupón aún no está activo');
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      throw badRequest('El cupón ha expirado');
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw badRequest('El cupón ha alcanzado su límite de usos');
    }

    res.json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          description: coupon.description || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
