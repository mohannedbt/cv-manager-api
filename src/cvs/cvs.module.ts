import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CvsController } from './cvs.controller';
import { Cv } from './entities/cv.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { AuthUserMiddleware } from '../common/middleware/auth-user.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Cv, User, Skill])],
  controllers: [CvsController],
  providers: [CvsService],
})
export class CvsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthUserMiddleware)
      .forRoutes(
        { path: 'cvs', method: RequestMethod.POST },
        { path: 'cvs/:id', method: RequestMethod.PATCH },
        { path: 'cvs/:id', method: RequestMethod.DELETE },
      );
  }
}
  