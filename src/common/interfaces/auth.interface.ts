import { Request } from 'express';

export interface AuthenticatedUser {
  userId: number;
  username: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}
