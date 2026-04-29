import {
  Controller,
  Sse,
  MessageEvent,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { map, Observable, filter } from 'rxjs';
import { SseService } from './sse.service';

@Controller('events')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse()
  @UseGuards(AuthGuard('jwt')) // 🔐 REQUIRED for req.user
  stream(@Req() req: any): Observable<MessageEvent> {
    const user = req.user;

    return this.sseService.stream().pipe(
      filter((event) => {
        // admin sees everything
        if (user.role === 'admin') return true;

        // normal user sees only own events
        return event.ownerId === user.userId;
      }),

      map((event) => ({
        data: event,
      })),
    );
  }
}