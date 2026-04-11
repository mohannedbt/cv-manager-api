import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  // Registers User repository provider for DI in UsersService.
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  // RolesGuard is provided here because UsersController uses it in @UseGuards.
  providers: [UsersService, RolesGuard],
  // Export UsersService so AuthModule can inject it.
  exports: [UsersService],
})
export class UsersModule {}
