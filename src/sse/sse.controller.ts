import {
  Controller,
  Sse,
  type MessageEvent,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable, fromEvent } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CV_EVENTS } from '../cv-logs/entities/cv-event';
@Controller('events')
export class SseController {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Sse('sse') // Matches the course @Sse('sse') decorator
  @UseGuards(AuthGuard('jwt'))
  stream(@Req() req: any): Observable<MessageEvent> {
    const user = req.user;

    // Use fromEvent to bridge the EventEmitter to the RxJS Observable
    return fromEvent(this.eventEmitter, CV_EVENTS.modify).pipe(
      filter((payload: any) => {
        // Admin sees everything
        if (user.role === 'admin') return true;

        // Normal user sees only own events
        return payload.ownerId === user.userId;
      }),
      map((payload: any) => {
        console.log({ payload });
        // Wrap the payload in a MessageEvent instance as required by the course
        return new MessageEvent('cv-modification', { data: payload });
      }),
    );
  }
}