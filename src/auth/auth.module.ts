import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    // Import UsersModule so AuthService can inject UsersService.
    UsersModule,
    // TP auth stage: Passport + JWT strategy/guards configuration.
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  // AuthController exposes register/login routes.
  controllers: [AuthController],
  // Providers are DI-resolved services/strategies used by this module.
  providers: [AuthService, LocalStrategy, JwtStrategy],
  // Exported providers can be reused by other modules (e.g., JWT guards).
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}