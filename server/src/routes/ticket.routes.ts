import { Router, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { notFound, validationError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authenticate);

// Get all tickets
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;

    const where: any = { userId: req.user!.id };
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: {
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

// Get departments
router.get('/departments', async (_req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    res.json({
      success: true,
      data: { departments },
    });
  } catch (error) {
    next(error);
  }
});

// Create ticket
router.post('/', [
  body('subject').trim().notEmpty().withMessage('Asunto requerido'),
  body('message').trim().notEmpty().withMessage('Mensaje requerido'),
  body('departmentId').optional().isUUID(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw validationError(errors.array());
    }

    const { subject, message, departmentId, priority, serviceId } = req.body;

    // Generate ticket number
    const count = await prisma.ticket.count();
    const ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;

    const ticket = await prisma.ticket.create({
      data: {
        id: uuidv4(),
        ticketNumber,
        userId: req.user!.id,
        department: departmentId ? undefined : 'General',
        subject,
        priority: priority || 'MEDIUM',
        replies: {
          create: {
            id: uuidv4(),
            userId: req.user!.id,
            message,
            isStaff: false,
          },
        },
        ...(departmentId && {
          ticketDepartment: {
            create: {
              id: uuidv4(),
              departmentId,
            },
          },
        }),
      },
      include: {
        ticketDepartment: {
          include: { department: { select: { name: true } } }
        },
        replies: {
          include: {
            user: { select: { firstName: true, lastName: true, avatar: true, role: true } },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
});

// Get single ticket
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      include: {
        ticketDepartment: {
          include: { department: { select: { name: true } } }
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { firstName: true, lastName: true, avatar: true, role: true } },
          },
        },
      },
    });

    if (!ticket) {
      throw notFound('Ticket no encontrado');
    }

    res.json({
      success: true,
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
});

// Reply to ticket
router.post('/:id/reply', [
  body('message').trim().notEmpty().withMessage('Mensaje requerido'),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw validationError(errors.array());
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
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
        isStaff: false,
      },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true, role: true } },
      },
    });

    // Update ticket
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'CUSTOMER_REPLY',
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

// Close ticket
router.put('/:id/close', async (req: AuthRequest, res, next) => {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!ticket) {
      throw notFound('Ticket no encontrado');
    }

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Ticket cerrado',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
