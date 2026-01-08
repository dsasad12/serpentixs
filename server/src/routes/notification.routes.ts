import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { NotificationService } from '../services/notification.service.js';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// NOTIFICATION ROUTES
// ============================================

// Get user notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const notifications = await NotificationService.getUserNotifications(userId, limit);
    const unreadCount = await NotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ success: false, error: 'Error al obtener notificaciones' });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const count = await NotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ success: false, error: 'Error al obtener contador' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    await NotificationService.markAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notificación marcada como leída',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: 'Error al marcar notificación' });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await NotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, error: 'Error al marcar notificaciones' });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });

    res.json({
      success: true,
      message: 'Notificación eliminada',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar notificación' });
  }
});

// Delete all read notifications
router.delete('/clear/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    res.json({
      success: true,
      message: 'Notificaciones leídas eliminadas',
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ success: false, error: 'Error al limpiar notificaciones' });
  }
});

export default router;
