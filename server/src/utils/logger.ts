import winston from 'winston';
import path from 'path';
import { config } from '../config/index.js';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    ),
  }),
];

// Add file transport in production
if (config.env === 'production') {
  const logDir = path.dirname(config.log.file);
  
  transports.push(
    new winston.transports.File({
      filename: config.log.file,
      maxsize: parseInt(config.log.maxSize) * 1024 * 1024,
      maxFiles: parseInt(config.log.maxFiles),
      format: logFormat,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: parseInt(config.log.maxSize) * 1024 * 1024,
      maxFiles: parseInt(config.log.maxFiles),
      format: logFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: config.log.level,
  transports,
});

export default logger;
