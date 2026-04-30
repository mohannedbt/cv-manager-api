import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CvsModule } from './cvs/cvs.module';
import { UsersModule } from './users/users.module';
import { SkillsModule } from './skills/skills.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

import { AuthModule } from './auth/auth.module'; 
import { CvLogsModule } from './cv-logs/cv-logs.module';

const envFilePath = [join(process.cwd(), '.env')];

if (process.env.ALLOW_PARENT_ENV === 'true') {
  envFilePath.push(join(process.cwd(), '..', '.env'));
}

@Module({
  imports: [
    // Global configuration provider, injectable through ConfigService anywhere.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    // Root DB connection provider used by feature modules that register repositories.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: +config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'cv_manager'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    CvsModule,
    UsersModule,
    SkillsModule,
    // AuthModule exports auth providers/strategies used by guards.
    AuthModule,
    CvLogsModule,
  ],
  // Root controller/provider are app bootstrap defaults.
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}