import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthUserMiddleware } from './auth-user.middleware';
import { Request, Response } from 'express';

const makeRequest = (headers: Request['headers']): Request => {
  return { headers } as unknown as Request;
};

describe('AuthUserMiddleware', () => {
  let middleware: AuthUserMiddleware;
  const jwtSecret = 'test-secret-key';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthUserMiddleware,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'JWT_SECRET') return jwtSecret;
              return null;
            },
          },
        },
      ],
    }).compile();

    middleware = module.get<AuthUserMiddleware>(AuthUserMiddleware);
  });

  describe('valid token', () => {
    it('should attach user object to request and call next', () => {
      const token = jwt.sign(
        { userId: 42, username: 'testuser', role: 'user' },
        jwtSecret,
      );
      const req = makeRequest({
        'auth-user': token,
      });
      const res = {} as Response;
      const next = jest.fn();

      middleware.use(req, res, next);

      expect((req as any).user).toEqual({
        userId: 42,
        username: 'testuser',
        role: 'user',
      });
      expect(next).toHaveBeenCalled();
    });

    it('should still support Authorization Bearer header', () => {
      const token = jwt.sign(
        { userId: 123, username: 'john', role: 'admin' },
        jwtSecret,
      );
      const req = makeRequest({
        authorization: `Bearer ${token}`,
      });
      const res = {} as Response;
      const next = jest.fn();

      middleware.use(req, res, next);

      expect((req as any).user.userId).toBe(123);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('missing token header', () => {
    it('should throw 401 Unauthorized when both headers are missing', () => {
      const req = makeRequest({});
      const res = {} as Response;
      const next = jest.fn();

      expect(() => middleware.use(req, res, next)).toThrow(
        new HttpException(
          'Missing auth token. Use auth-user header or Authorization: Bearer <token>',
          HttpStatus.UNAUTHORIZED,
        ),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('invalid format', () => {
    it('should throw 400 Bad Request when format is not Bearer <token>', () => {
      const req = makeRequest({ authorization: 'InvalidHeader' });
      const res = {} as Response;
      const next = jest.fn();

      expect(() => middleware.use(req, res, next)).toThrow(
        new HttpException(
          'Invalid authorization header format. Expected: Bearer <token>',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw 400 Bad Request when missing Bearer prefix', () => {
      const req = makeRequest({ authorization: 'just-a-token' });
      const res = {} as Response;
      const next = jest.fn();

      expect(() => middleware.use(req, res, next)).toThrow(
        new HttpException(
          'Invalid authorization header format. Expected: Bearer <token>',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw 400 Bad Request when Bearer has multiple tokens', () => {
      const req = makeRequest({ authorization: 'Bearer token1 token2' });
      const res = {} as Response;
      const next = jest.fn();

      expect(() => middleware.use(req, res, next)).toThrow(
        new HttpException(
          'Invalid authorization header format. Expected: Bearer <token>',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('invalid or expired token', () => {
    it('should throw 401 Unauthorized for invalid token', () => {
      const req = makeRequest({ 'auth-user': 'invalid.token.here' });
      const res = {} as Response;
      const next = jest.fn();

      expect(() => middleware.use(req, res, next)).toThrow(
        new HttpException('Invalid token', HttpStatus.UNAUTHORIZED),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw 401 Unauthorized for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: 42, username: 'testuser', role: 'user' },
        jwtSecret,
        { expiresIn: '-1h' },
      );
      const req = makeRequest({ 'auth-user': expiredToken });
      const res = {} as Response;
      const next = jest.fn();

      expect(() => middleware.use(req, res, next)).toThrow(
        new HttpException('Token expired', HttpStatus.UNAUTHORIZED),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw 401 Unauthorized when token is signed with different secret', () => {
      const wrongSecret = 'different-secret';
      const token = jwt.sign(
        { userId: 42, username: 'testuser', role: 'user' },
        wrongSecret,
      );
      const req = makeRequest({ 'auth-user': token });
      const res = {} as Response;
      const next = jest.fn();

      expect(() => middleware.use(req, res, next)).toThrow(
        new HttpException('Invalid token', HttpStatus.UNAUTHORIZED),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('payload checks', () => {
    it('should handle token with additional payload fields', () => {
      const token = jwt.sign(
        { userId: 99, username: 'testuser', role: 'admin', email: 'test@example.com' },
        jwtSecret,
      );
      const req = makeRequest({ 'auth-user': token });
      const res = {} as Response;
      const next = jest.fn();

      middleware.use(req, res, next);

      expect((req as any).user.userId).toBe(99);
      expect(next).toHaveBeenCalled();
    });

    it('should reject payloads without role', () => {
      const token = jwt.sign(
        { userId: 42, username: 'testuser' },
        jwtSecret,
      );
      const req = makeRequest({ 'auth-user': token });
      const res = {} as Response;
      const next = jest.fn();

      expect(() => middleware.use(req, res, next)).toThrow(
        new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED),
      );
    });
  });
});
