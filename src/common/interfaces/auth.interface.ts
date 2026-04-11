import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId: number;
}

export interface JwtPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}
