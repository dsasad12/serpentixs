import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  errors?: any[];
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // Log error
  logger.error(`${req.method} ${req.path} - ${statusCode} - ${message}`, {
    error: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code,
      ...(process.env.APP_ENV === 'development' && { stack: err.stack }),
      ...(err.errors && { errors: err.errors }),
    },
  });
}

export function createError(message: string, statusCode = 500, code?: string): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

export function notFound(message = 'Recurso no encontrado'): AppError {
  return createError(message, 404, 'NOT_FOUND');
}

export function badRequest(message = 'Solicitud inválida'): AppError {
  return createError(message, 400, 'BAD_REQUEST');
}

export function unauthorized(message = 'No autorizado'): AppError {
  return createError(message, 401, 'UNAUTHORIZED');
}

export function forbidden(message = 'Acceso denegado'): AppError {
  return createError(message, 403, 'FORBIDDEN');
}

export function conflict(message = 'Conflicto'): AppError {
  return createError(message, 409, 'CONFLICT');
}

export function validationError(errors: any[]): AppError {
  const error: AppError = createError('Error de validación', 422, 'VALIDATION_ERROR');
  error.errors = errors;
  return error;
}
