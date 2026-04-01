import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // reads "Authorization: Bearer <token>"
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: { userId: number; username: string; role: string }) {
    // passport puts the return value on req.user
    return { userId: payload.userId, username: payload.username, role: payload.role };
  }
}