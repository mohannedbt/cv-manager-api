import { Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  controllers: [SseController],
  providers: [EventEmitter2],
  exports: [EventEmitter2], 
})
export class SseModule {}