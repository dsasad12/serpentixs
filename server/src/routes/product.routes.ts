import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { optionalAuth, AuthRequest } from '../middleware/auth.js';
import { notFound } from '../middleware/errorHandler.js';

const router = Router();

// Get all categories with products
router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            pricing: { where: { isActive: true } },
          },
        },
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

// Get single category
router.get('/categories/:slug', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            pricing: { where: { isActive: true } },
            configOptions: {
              include: { values: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!category || !category.isActive) {
      throw notFound('Categoría no encontrada');
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
});

// Get all products
router.get('/', async (req, res, next) => {
  try {
    const { category, search, page = '1', limit = '12' } = req.query;

    const where: any = { isActive: true };

    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category as string } });
      if (cat) {
        where.categoryId = cat.id;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
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
          pricing: { where: { isActive: true } },
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

// Get single product
router.get('/:slug', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        pricing: { where: { isActive: true }, orderBy: { price: 'asc' } },
        configOptions: {
          orderBy: { order: 'asc' },
          include: {
            values: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!product || !product.isActive) {
      throw notFound('Producto no encontrado');
    }

    // Parse features JSON
    const productWithFeatures = {
      ...product,
      features: product.features ? JSON.parse(product.features as string) : [],
    };

    res.json({
      success: true,
      data: { product: productWithFeatures },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
