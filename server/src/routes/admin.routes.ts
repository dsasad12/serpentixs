import { Router, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { notFound, validationError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

// Type for Setting model
interface SettingRecord {
  id: string;
  key: string;
  value: string | null;
  type: string;
  group: string;
  isPublic: boolean;
}

const router = Router();

// All admin routes require authentication and admin/staff role
router.use(authenticate);
router.use(requireRole('ADMIN', 'STAFF'));

// ========== DASHBOARD ==========
router.get('/dashboard/stats', async (_req, res, next) => {
  try {
    const [
      totalUsers,
      totalServices,
      activeServices,
      totalRevenue,
      pendingInvoices,
      openTickets,
      recentOrders,
      recentTickets,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.service.count(),
      prisma.service.count({ where: { status: 'ACTIVE' } }),
      prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.invoice.count({ where: { status: { in: ['UNPAID', 'OVERDUE'] } } }),
      prisma.ticket.count({ where: { status: { not: 'CLOSED' } } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.ticket.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true } },
          ticketDepartment: {
            include: { department: { select: { name: true } } }
          },
        },
      }),
    ]);

    // Monthly revenue (last 12 months)
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', paidAt) as month,
        SUM(total) as revenue
      FROM invoices
      WHERE status = 'PAID' AND paidAt IS NOT NULL
      GROUP BY strftime('%Y-%m', paidAt)
      ORDER BY month DESC
      LIMIT 12
    `;

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalServices,
          activeServices,
          totalRevenue: totalRevenue._sum.total || 0,
          pendingInvoices,
          openTickets,
        },
        recentOrders,
        recentTickets,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ========== USERS ==========
router.get('/users', async (req, res, next) => {
  try {
    const { search, role, status, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search as string } },
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { services: true, invoices: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
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

router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        services: { take: 10, orderBy: { createdAt: 'desc' } },
        invoices: { take: 10, orderBy: { createdAt: 'desc' } },
        tickets: { take: 10, orderBy: { createdAt: 'desc' } },
        addresses: true,
      },
    });

    if (!user) {
      throw notFound('Usuario no encontrado');
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/users', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('role').isIn(['ADMIN', 'STAFF', 'CLIENT']),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw validationError(errors.array());
    }

    const { email, password, firstName, lastName, role, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id', async (req, res, next) => {
  try {
    const { firstName, lastName, phone, role, status } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
        ...(status && { status }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// ========== PRODUCTS ==========
router.get('/products', async (req, res, next) => {
  try {
    const { category, search, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category as string } });
      if (cat) where.categoryId = cat.id;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { slug: { contains: search as string } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { order: 'asc' },
        skip,
        take: parseInt(limit as string),
        include: {
          category: { select: { name: true, slug: true } },
          pricing: true,
          _count: { select: { services: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        products,
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

router.post('/products', async (req, res, next) => {
  try {
    const { categoryId, name, slug, description, shortDescription, features, pricing, isActive } = req.body;

    const product = await prisma.product.create({
      data: {
        id: uuidv4(),
        categoryId,
        name,
        slug,
        description,
        shortDescription,
        features: features ? JSON.parse(JSON.stringify(features)) : undefined,
        isActive: isActive ?? true,
        pricing: {
          create: pricing?.map((p: any) => ({
            id: uuidv4(),
            billingCycle: p.billingCycle,
            price: p.price,
            setupFee: p.setupFee || 0,
          })) || [],
        },
      },
      include: {
        category: true,
        pricing: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    const { name, slug, description, shortDescription, features, isActive } = req.body;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(features && { features: JSON.stringify(features) }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: true,
        pricing: true,
      },
    });

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
});

// ========== CATEGORIES ==========
router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/categories', async (req, res, next) => {
  try {
    const { name, slug, description, icon, order, isActive } = req.body;

    const category = await prisma.category.create({
      data: {
        id: uuidv4(),
        name,
        slug,
        description,
        icon,
        order: order || 0,
        isActive: isActive ?? true,
      },
    });

    res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
});

// ========== SETTINGS ==========
router.get('/settings', async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });

    // Group settings
    const grouped = settings.reduce((acc: Record<string, Record<string, unknown>>, s: SettingRecord) => {
      if (!acc[s.group]) acc[s.group] = {};
      acc[s.group][s.key] = {
        value: s.type === 'boolean' ? s.value === 'true' : s.value,
        type: s.type,
        isPublic: s.isPublic,
      };
      return acc;
    }, {} as Record<string, Record<string, unknown>>);

    res.json({
      success: true,
      data: { settings: grouped },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/settings', async (req: AuthRequest, res, next) => {
  try {
    const { settings } = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: {
          id: uuidv4(),
          key,
          value: String(value),
          group: 'general',
        },
      });
    }

    res.json({
      success: true,
      message: 'Configuración actualizada',
    });
  } catch (error) {
    next(error);
  }
});

// ========== TICKETS (Admin view) ==========
router.get('/tickets', async (req, res, next) => {
  try {
    const { status, priority, department, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (department) {
      where.ticketDepartment = { departmentId: department };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          ticketDepartment: {
            include: { department: { select: { name: true } } }
          },
          _count: { select: { replies: true } },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        tickets,
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

router.post('/tickets/:id/reply', [
  body('message').trim().notEmpty(),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw validationError(errors.array());
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });

    if (!ticket) {
      throw notFound('Ticket no encontrado');
    }

    const reply = await prisma.ticketReply.create({
      data: {
        id: uuidv4(),
        ticketId: ticket.id,
        userId: req.user!.id,
        message: req.body.message,
        isStaff: true,
      },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true, role: true } },
      },
    });

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'ANSWERED',
        lastReplyAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      data: { reply },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/tickets/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === 'CLOSED' && { closedAt: new Date() }),
      },
    });

    res.json({
      success: true,
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
});

// ========== INVOICES (Admin) ==========
router.get('/invoices', async (req, res, next) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        invoices,
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

export default router;
