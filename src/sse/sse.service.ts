import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface CvEvent {
  type: string;
  cvId: number;
  ownerId: number;
  payload?: any;
}

@Injectable()
export class SseService {
  private eventBus = new Subject<CvEvent>();

  // stream consumed by controller
  stream(): Observable<CvEvent> {
    return this.eventBus.asObservable();
  }

  // called by CvService
  publish(event: CvEvent) {
    this.eventBus.next(event);
  }
}