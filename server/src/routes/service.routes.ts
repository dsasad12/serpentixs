import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { notFound } from '../middleware/errorHandler.js';

const router = Router();

router.use(authenticate);

// Get all services for current user
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;

    const where: any = { userId: req.user!.id };
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: {
          product: {
            select: { name: true, slug: true, category: { select: { name: true, slug: true } } },
          },
        },
      }),
      prisma.service.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        services,
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

// Get single service
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const service = await prisma.service.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      include: {
        product: {
          include: { category: true },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!service) {
      throw notFound('Servicio no encontrado');
    }

    res.json({
      success: true,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
});

// Get service stats
router.get('/stats/summary', async (req: AuthRequest, res, next) => {
  try {
    const [active, pending, suspended, total] = await Promise.all([
      prisma.service.count({ where: { userId: req.user!.id, status: 'ACTIVE' } }),
      prisma.service.count({ where: { userId: req.user!.id, status: 'PENDING' } }),
      prisma.service.count({ where: { userId: req.user!.id, status: 'SUSPENDED' } }),
      prisma.service.count({ where: { userId: req.user!.id } }),
    ]);

    res.json({
      success: true,
      data: { active, pending, suspended, total },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
