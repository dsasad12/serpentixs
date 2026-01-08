import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';

const router = Router();

// Get public settings
router.get('/public', async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findMany({
      where: { isPublic: true },
    });

    const settingsMap = settings.reduce((acc: Record<string, unknown>, s: { key: string; value: string | null; type: string }) => {
      acc[s.key] = s.type === 'boolean' ? s.value === 'true' : s.value;
      return acc;
    }, {} as Record<string, unknown>);

    // Add config values
    settingsMap.currency = config.billing.currency;
    settingsMap.currencySymbol = config.billing.currencySymbol;
    settingsMap.theme = config.theme;
    settingsMap.company = config.company;

    res.json({
      success: true,
      data: { settings: settingsMap },
    });
  } catch (error) {
    next(error);
  }
});

// Get payment gateways
router.get('/payment-gateways', async (_req, res, next) => {
  try {
    const gateways = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        icon: true,
        gateway: true,
      },
    });

    res.json({
      success: true,
      data: { gateways },
    });
  } catch (error) {
    next(error);
  }
});

// Get announcements
router.get('/announcements', async (_req, res, next) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isPublished: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

    res.json({
      success: true,
      data: { announcements },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
