import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CvLogsService } from './cv-logs.service';
import { CV_EVENTS } from './entities/cv-event';

@Injectable()
export class CvLogsListener implements OnApplicationBootstrap {

  constructor(private readonly cvLogsService: CvLogsService) {}

  onApplicationBootstrap() {
    console.log('✅ CvLogsListener READY');
  }

  @OnEvent(CV_EVENTS.modify, { async: true })
  async handleCvEvent(payload: any) {
    console.log('🔥 EVENT RECEIVED', payload);

    const { type, cvId, ownerId } = payload;
    await this.cvLogsService.log(type, cvId, ownerId);
  }
}