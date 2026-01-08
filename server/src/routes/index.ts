import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import serviceRoutes from './service.routes.js';
import invoiceRoutes from './invoice.routes.js';
import ticketRoutes from './ticket.routes.js';
import orderRoutes from './order.routes.js';
import settingsRoutes from './settings.routes.js';
import adminRoutes from './admin.routes.js';
import paymentRoutes from './payment.routes.js';
import integrationRoutes from './integration.routes.js';
import twofaRoutes from './twofa.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

// Public routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/settings', settingsRoutes);

// Payment routes (includes webhooks)
router.use('/payments', paymentRoutes);

// Integration routes
router.use('/integrations', integrationRoutes);

// 2FA routes
router.use('/2fa', twofaRoutes);

// Notification routes
router.use('/notifications', notificationRoutes);

// Protected routes
router.use('/user', userRoutes);
router.use('/services', serviceRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/tickets', ticketRoutes);
router.use('/orders', orderRoutes);

// Admin routes
router.use('/admin', adminRoutes);

export default router;
