import { Module } from '@nestjs/common';
import { CvLogsService } from './cv-logs.service';
import { CvLogsController } from './cv-logs.controller';
import { CvLog } from './entities/cv-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

// cv-logs/cv-logs.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([CvLog])],
  providers: [CvLogsService],
  exports: [CvLogsService], // ← important
  controllers: [CvLogsController]
})
export class CvLogsModule {}