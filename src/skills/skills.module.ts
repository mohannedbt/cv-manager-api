import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';

@Module({
  // Registers Skill repository provider for SkillsService.
  imports: [TypeOrmModule.forFeature([Skill])],
  controllers: [SkillsController],
  // SkillsService contains skills business logic and persistence calls.
  providers: [SkillsService],
})
export class SkillsModule {}
