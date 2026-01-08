import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.APP_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

if (process.env.APP_ENV !== 'production') {
  global.prisma = prisma;
}

// Test connection
prisma.$connect()
  .then(() => {
    logger.info('✅ Conexión a base de datos establecida');
  })
  .catch((error) => {
    logger.error('❌ Error conectando a la base de datos:', error);
    process.exit(1);
  });

export default prisma;
