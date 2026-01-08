import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should return 422 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'Test123!@#',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(422);
    });

    it('should return 422 if password is too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(422);
    });

    it('should return 422 if firstName is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#',
          lastName: 'User',
        });

      expect(response.status).toBe(422);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 422 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'Test123!@#',
        });

      expect(response.status).toBe(422);
    });

    it('should return 422 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(422);
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
    });
  });
});
