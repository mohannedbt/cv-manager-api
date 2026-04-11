import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload } from '../interfaces/auth.interface';

@Injectable()
export class AuthUserMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    // Check if header exists
    if (!authHeader) {
      throw new HttpException(
        'Missing authorization header',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check Bearer format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new HttpException(
        'Invalid authorization header format. Expected: Bearer <token>',
        HttpStatus.BAD_REQUEST,
      );
    }

    const token = parts[1];
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    try {
      const payload = jwt.verify(token, jwtSecret) as JwtPayload;
      (req as AuthenticatedRequest).userId = payload.userId;
      next();
    } catch (error) {
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
