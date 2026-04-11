import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload } from '../interfaces/auth.interface';

function isJwtPayload(payload: unknown): payload is JwtPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'userId' in payload &&
    typeof (payload as { userId: unknown }).userId === 'number' &&
    'username' in payload &&
    typeof (payload as { username: unknown }).username === 'string' &&
    'role' in payload &&
    typeof (payload as { role: unknown }).role === 'string'
  );
}

@Injectable()
export class AuthUserMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const authUserHeader = req.headers['auth-user'];
    const authorizationHeader = req.headers.authorization;

    if (!authUserHeader && !authorizationHeader) {
      throw new HttpException(
        'Missing auth token. Use auth-user header or Authorization: Bearer <token>',
        HttpStatus.UNAUTHORIZED,
      );
    }

    let token: string | undefined;

    // TP requirement: support JWT from `auth-user` header for protected CV write routes.
    if (typeof authUserHeader === 'string' && authUserHeader.trim().length > 0) {
      token = authUserHeader.trim();
    } else if (authorizationHeader) {
      const parts = authorizationHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new HttpException(
          'Invalid authorization header format. Expected: Bearer <token>',
          HttpStatus.BAD_REQUEST,
        );
      }
      token = parts[1];
    }

    if (!token) {
      throw new HttpException('Missing token', HttpStatus.UNAUTHORIZED);
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new HttpException(
        'JWT secret is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const payload = jwt.verify(token, jwtSecret);

      if (!isJwtPayload(payload)) {
        throw new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED);
      }

      // Inject authenticated user context so services can enforce ownership rules.
      (req as AuthenticatedRequest).user = {
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
      };
      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
