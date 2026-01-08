import { Router, Request, Response } from 'express';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// TWO-FACTOR AUTHENTICATION (2FA) ROUTES
// ============================================

// Generate 2FA secret and QR code
router.post('/setup', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ success: false, error: '2FA ya está habilitado' });
    }

    // Generate secret
    const secret = authenticator.generateSecret();
    const appName = process.env.APP_NAME || 'SerpentixPay';
    
    // Generate OTP Auth URL
    const otpAuthUrl = authenticator.keyuri(user.email, appName, secret);

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    // Store secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    res.json({
      success: true,
      data: {
        secret,
        qrCode: qrCodeDataUrl,
        manualEntry: secret,
      },
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ success: false, error: 'Error al configurar 2FA' });
  }
});

// Verify and enable 2FA
router.post('/enable', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { code } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    if (!code) {
      return res.status(400).json({ success: false, error: 'Código requerido' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, error: 'Primero debes configurar 2FA' });
    }

    // Verify the code
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Código inválido' });
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    // Store backup codes (in production, hash these)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: JSON.stringify(backupCodes),
      },
    });

    res.json({
      success: true,
      message: '2FA habilitado correctamente',
      data: { backupCodes },
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ success: false, error: 'Error al habilitar 2FA' });
  }
});

// Verify 2FA code (for login)
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ success: false, error: 'userId y código requeridos' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
      return res.status(400).json({ success: false, error: '2FA no está configurado' });
    }

    // Check if it's a backup code
    if (user.twoFactorBackupCodes) {
      const backupCodes = JSON.parse(user.twoFactorBackupCodes as string) as string[];
      const codeIndex = backupCodes.indexOf(code.toUpperCase());
      
      if (codeIndex !== -1) {
        // Remove used backup code
        backupCodes.splice(codeIndex, 1);
        await prisma.user.update({
          where: { id: userId },
          data: { twoFactorBackupCodes: JSON.stringify(backupCodes) },
        });
        
        return res.json({ success: true, message: 'Código de respaldo válido' });
      }
    }

    // Verify TOTP code
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Código inválido' });
    }

    res.json({ success: true, message: 'Código válido' });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ success: false, error: 'Error al verificar código' });
  }
});

// Disable 2FA
router.post('/disable', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { code, password } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ success: false, error: '2FA no está habilitado' });
    }

    // Verify password
    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: 'Contraseña incorrecta' });
    }

    // Verify 2FA code
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret!,
    });

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Código 2FA inválido' });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
      },
    });

    res.json({ success: true, message: '2FA deshabilitado correctamente' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ success: false, error: 'Error al deshabilitar 2FA' });
  }
});

// Get 2FA status
router.get('/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    res.json({
      success: true,
      data: { enabled: user?.twoFactorEnabled || false },
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({ success: false, error: 'Error al obtener estado de 2FA' });
  }
});

// Regenerate backup codes
router.post('/backup-codes/regenerate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { code } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ success: false, error: '2FA no está habilitado' });
    }

    // Verify 2FA code
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret!,
    });

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Código 2FA inválido' });
    }

    // Generate new backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorBackupCodes: JSON.stringify(backupCodes) },
    });

    res.json({
      success: true,
      message: 'Códigos de respaldo regenerados',
      data: { backupCodes },
    });
  } catch (error) {
    console.error('Backup codes regenerate error:', error);
    res.status(500).json({ success: false, error: 'Error al regenerar códigos' });
  }
});

export default router;
