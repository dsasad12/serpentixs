import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { notFound } from '../middleware/errorHandler.js';
import { InvoicePDFService } from '../services/pdf.service.js';

const router = Router();

router.use(authenticate);

// Get all invoices for current user
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;

    const where: any = { userId: req.user!.id };
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: {
          items: true,
          service: { select: { name: true } },
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

// Get invoice stats
router.get('/stats/summary', async (req: AuthRequest, res, next) => {
  try {
    const [unpaid, paid, overdue] = await Promise.all([
      prisma.invoice.aggregate({
        where: { userId: req.user!.id, status: 'UNPAID' },
        _sum: { total: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: { userId: req.user!.id, status: 'PAID' },
        _sum: { total: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: { userId: req.user!.id, status: 'OVERDUE' },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        unpaid: { count: unpaid._count, total: unpaid._sum.total || 0 },
        paid: { count: paid._count, total: paid._sum.total || 0 },
        overdue: { count: overdue._count, total: overdue._sum.total || 0 },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single invoice
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      include: {
        items: true,
        payments: true,
        service: { select: { name: true, domain: true } },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            addresses: { where: { type: 'BILLING', isDefault: true }, take: 1 },
          },
        },
      },
    });

    if (!invoice) {
      throw notFound('Factura no encontrada');
    }

    res.json({
      success: true,
      data: { invoice },
    });
  } catch (error) {
    next(error);
  }
});

// Get invoice PDF data (client renders PDF)
router.get('/:id/pdf-data', async (req: AuthRequest, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      include: {
        items: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            addresses: { where: { type: 'BILLING', isDefault: true }, take: 1 },
          },
        },
      },
    });

    if (!invoice) {
      throw notFound('Factura no encontrada');
    }

    // Get company settings
    const settings = await prisma.setting.findMany({
      where: { group: 'general' },
    });

    const companySettings = settings.reduce((acc: Record<string, string | null>, s: { key: string; value: string | null }) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string | null>);

    res.json({
      success: true,
      data: {
        invoice,
        company: companySettings,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Download invoice as PDF
router.get('/:id/pdf', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Verify the invoice belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Factura no encontrada' });
    }

    const pdfBuffer = await InvoicePDFService.generateInvoicePDF(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="factura-${invoice.invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    next(error);
  }
});

export default router;
