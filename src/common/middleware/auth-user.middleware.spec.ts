import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthUserMiddleware } from './auth-user.middleware';
import { Request, Response, NextFunction } from 'express';

describe('AuthUserMiddleware', () => {
  let middleware: AuthUserMiddleware;
  let configService: ConfigService;
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
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('valid token', () => {
    it('should attach userId to request and call next', () => {
      const token = jwt.sign(
        { userId: 42, username: 'testuser' },
        jwtSecret,
      );
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;
      const res = {} as Response;
      const next = jest.fn();

      middleware.use(req, res, next);

      expect((req as any).userId).toBe(42);
      expect(next).toHaveBeenCalled();
    });

    it('should extract correct userId from token payload', () => {
      const token = jwt.sign(
        { userId: 123, username: 'john' },
        jwtSecret,
      );
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;
      const res = {} as Response;
      const next = jest.fn();

      middleware.use(req, res, next);

      expect((req as any).userId).toBe(123);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('missing authorization header', () => {
    it('should throw 401 Unauthorized when header is missing', () => {
      const req = {
        headers: {},
      } as Request;
      const res = {} as Response;
      const next = jest.fn();

      expect(() => middleware.use(req, res, next)).toThrow(
        new HttpException(
          'Missing authorization header',
          HttpStatus.UNAUTHORIZED,
        ),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw 401 Unauthorized when header is null', () => {
      const req = {
        headers: {
          authorization: null,
        },
      } as Request;
      const res = {} as Response;
      const next = jest.fn();

      expect(() => middleware.use(req, res, next)).toThrow(
        new HttpException(
          'Missing authorization header',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });
  });

  describe('invalid format', () => {
    it('should throw 400 Bad Request when format is not Bearer <token>', () => {
      const req = {
        headers: {
          authorization: 'InvalidHeader',
        },
      } as Request;
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
      const req = {
        headers: {
          authorization: 'just-a-token',
        },
      } as Request;
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
      const req = {
        headers: {
          authorization: 'Bearer token1 token2',
        },
      } as Request;
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
      const req = {
        headers: {
          authorization: 'Bearer invalid.token.here',
        },
      } as Request;
      const res = {} as Response;
      const next = jest.fn();

      expect(() => middleware.use(req, res, next)).toThrow(
        new HttpException('Invalid token', HttpStatus.UNAUTHORIZED),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw 401 Unauthorized for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: 42, username: 'testuser' },
        jwtSecret,
        { expiresIn: '-1h' },
      );
      const req = {
        headers: {
          authorization: `Bearer ${expiredToken}`,
        },
      } as Request;
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
        { userId: 42, username: 'testuser' },
        wrongSecret,
      );
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;
      const res = {} as Response;
      const next = jest.fn();

      expect(() => middleware.use(req, res, next)).toThrow(
        new HttpException('Invalid token', HttpStatus.UNAUTHORIZED),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle token with additional payload fields', () => {
      const token = jwt.sign(
        { userId: 99, username: 'testuser', role: 'admin', email: 'test@example.com' },
        jwtSecret,
      );
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;
      const res = {} as Response;
      const next = jest.fn();

      middleware.use(req, res, next);

      expect((req as any).userId).toBe(99);
      expect(next).toHaveBeenCalled();
    });

    it('should be case-sensitive for Bearer prefix', () => {
      const token = jwt.sign(
        { userId: 42, username: 'testuser' },
        jwtSecret,
      );
      const req = {
        headers: {
          authorization: `bearer ${token}`,
        },
      } as Request;
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
});
