import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { authenticate, AuthRequest, JwtPayload } from '../middleware/auth.js';
import { badRequest, unauthorized, conflict, validationError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Generate tokens
function generateTokens(user: { id: string; email: string; role: string }) {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, type: 'access' } as JwtPayload,
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as SignOptions
  );

  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, type: 'refresh' } as JwtPayload,
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn } as SignOptions
  );

  return { accessToken, refreshToken };
}

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('firstName').trim().notEmpty().withMessage('Nombre requerido'),
  body('lastName').trim().notEmpty().withMessage('Apellido requerido'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida'),
];

// Register
router.post('/register', registerValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw validationError(errors.array());
    }

    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw conflict('El email ya está registrado');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
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

    // Generate tokens
    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

    // Create session
    await prisma.session.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Set cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      success: true,
      message: 'Registro exitoso',
      data: {
        user,
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', loginValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw validationError(errors.array());
    }

    const { email, password, totpCode } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!user) {
      throw unauthorized('Credenciales inválidas');
    }

    if (user.status !== 'ACTIVE') {
      throw unauthorized('Tu cuenta está suspendida o inactiva');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw unauthorized('Credenciales inválidas');
    }

    // Check 2FA
    if (user.twoFactorEnabled) {
      if (!totpCode) {
        return res.status(200).json({
          success: true,
          requiresTwoFactor: true,
          message: 'Código 2FA requerido',
        });
      }

      const isValidTotp = authenticator.verify({
        token: totpCode,
        secret: user.twoFactorSecret!,
      });

      if (!isValidTotp) {
        throw unauthorized('Código 2FA inválido');
      }
    }

    // Generate tokens
    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: req.ip,
      },
    });

    // Create session
    await prisma.session.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Set cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      throw unauthorized('Refresh token requerido');
    }

    // Verify token
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as JwtPayload;

    if (decoded.type !== 'refresh') {
      throw unauthorized('Token inválido');
    }

    // Check session
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: { select: { id: true, email: true, role: true, status: true } } },
    });

    if (!session || session.expiresAt < new Date()) {
      throw unauthorized('Sesión expirada');
    }

    if (session.user.status !== 'ACTIVE') {
      throw unauthorized('Cuenta suspendida');
    }

    // Generate new tokens
    const tokens = generateTokens({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Set cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: { tokens },
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.accessToken;

    // Delete session
    if (token) {
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
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
        status: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLoginAt: true,
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

// Enable 2FA - Step 1: Generate secret
router.post('/2fa/setup', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { email: true, twoFactorEnabled: true },
    });

    if (user?.twoFactorEnabled) {
      throw badRequest('2FA ya está habilitado');
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user!.email, config.appName, secret);
    const qrCode = await QRCode.toDataURL(otpauth);

    // Store secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { twoFactorSecret: secret },
    });

    res.json({
      success: true,
      data: {
        secret,
        qrCode,
        otpauth,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Enable 2FA - Step 2: Verify and enable
router.post('/2fa/enable', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw badRequest('Código requerido');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (user?.twoFactorEnabled) {
      throw badRequest('2FA ya está habilitado');
    }

    if (!user?.twoFactorSecret) {
      throw badRequest('Primero debes configurar 2FA');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw badRequest('Código inválido');
    }

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { twoFactorEnabled: true },
    });

    res.json({
      success: true,
      message: '2FA habilitado exitosamente',
    });
  } catch (error) {
    next(error);
  }
});

// Disable 2FA
router.post('/2fa/disable', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { password, code } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { password: true, twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorEnabled) {
      throw badRequest('2FA no está habilitado');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw unauthorized('Contraseña incorrecta');
    }

    // Verify TOTP code
    const isValidTotp = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret!,
    });

    if (!isValidTotp) {
      throw badRequest('Código 2FA inválido');
    }

    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    res.json({
      success: true,
      message: '2FA deshabilitado exitosamente',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
