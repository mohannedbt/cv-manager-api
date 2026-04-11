import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('Username already taken');
    }
    // Password is hashed before persistence so login can verify with bcrypt.compare.
    const hashed = await bcrypt.hash(dto.password, 10);
    return this.usersService.create({ ...dto, password: hashed });
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    const { password: _, ...result } = user; // strip password before returning
    return result;
  }

  async login(user: any) {
    // role is included in JWT payload so role-based guards can authorize requests.
    const payload = { userId: user.id, username: user.username, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }
}