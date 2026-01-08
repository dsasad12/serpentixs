import { Router, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { badRequest, unauthorized, validationError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLoginAt: true,
        addresses: true,
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

// Update profile
router.put('/profile', [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().trim(),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw validationError(errors.array());
    }

    const { firstName, lastName, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
      },
    });

    res.json({
      success: true,
      message: 'Perfil actualizado',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/password', [
  body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
  body('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw validationError(errors.array());
    }

    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { password: true },
    });

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user!.password);
    if (!isValid) {
      throw unauthorized('Contraseña actual incorrecta');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    // Invalidate all sessions except current
    const token = req.headers.authorization?.replace('Bearer ', '');
    await prisma.session.deleteMany({
      where: {
        userId: req.user!.id,
        NOT: { token },
      },
    });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    next(error);
  }
});

// Get sessions
router.get('/sessions', async (req: AuthRequest, res, next) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user!.id },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const currentToken = req.headers.authorization?.replace('Bearer ', '');
    const currentSession = await prisma.session.findUnique({
      where: { token: currentToken },
      select: { id: true },
    });

    res.json({
      success: true,
      data: {
        sessions: sessions.map((s: { id: string; userAgent: string | null; ipAddress: string | null; createdAt: Date; expiresAt: Date }) => ({
          ...s,
          isCurrent: s.id === currentSession?.id,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Revoke session
router.delete('/sessions/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.session.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    res.json({
      success: true,
      message: 'Sesión revocada',
    });
  } catch (error) {
    next(error);
  }
});

// Revoke all sessions except current
router.delete('/sessions', async (req: AuthRequest, res, next) => {
  try {
    const currentToken = req.headers.authorization?.replace('Bearer ', '');

    await prisma.session.deleteMany({
      where: {
        userId: req.user!.id,
        NOT: { token: currentToken },
      },
    });

    res.json({
      success: true,
      message: 'Todas las demás sesiones han sido revocadas',
    });
  } catch (error) {
    next(error);
  }
});

// Get notifications
router.get('/notifications', async (req: AuthRequest, res, next) => {
  try {
    const { unreadOnly } = req.query;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user!.id,
        ...(unreadOnly === 'true' && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.id, isRead: false },
    });

    res.json({
      success: true,
      data: { notifications, unreadCount },
    });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Addresses
router.get('/addresses', async (req: AuthRequest, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({
      success: true,
      data: { addresses },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/addresses', async (req: AuthRequest, res, next) => {
  try {
    const { type, firstName, lastName, company, address1, address2, city, state, postalCode, country, phone, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, type },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        id: uuidv4(),
        userId: req.user!.id,
        type: type || 'BILLING',
        firstName,
        lastName,
        company,
        address1,
        address2,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({
      success: true,
      data: { address },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/addresses/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { type, firstName, lastName, company, address1, address2, city, state, postalCode, country, phone, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, type, NOT: { id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.updateMany({
      where: { id, userId: req.user!.id },
      data: {
        type,
        firstName,
        lastName,
        company,
        address1,
        address2,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefault,
      },
    });

    res.json({
      success: true,
      data: { address },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/addresses/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.address.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
