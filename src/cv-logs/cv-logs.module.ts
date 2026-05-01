import { Module } from '@nestjs/common';
import { CvLogsService } from './cv-logs.service';
import { CvLogsController } from './cv-logs.controller';
import { CvLog } from './entities/cv-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvLogsListener } from './cv-logs-listener';

// cv-logs/cv-logs.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([CvLog])],
  providers: [CvLogsService,CvLogsListener],
  exports: [CvLogsService], // ← important
  controllers: [CvLogsController]
})
export class CvLogsModule {
 constructor() {
  console.log('🚀 CvLogsModule initialized');
 }

}