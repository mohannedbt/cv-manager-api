import { Injectable } from '@nestjs/common';
import { CvLog } from './entities/cv-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// cv-logs/cv-logs.service.ts
@Injectable()
export class CvLogsService {
  constructor(
    @InjectRepository(CvLog)
    private cvLogRepo: Repository<CvLog>,
  ) {}

  log(type: string, cvId: number, userId: number) {
    const entry = this.cvLogRepo.create({ type, cvId, userId });
    return this.cvLogRepo.save(entry);
  }

  findAll() {
    return this.cvLogRepo.find();
  }

  findByCv(cvId: number) {
    return this.cvLogRepo.findBy({ cvId });
  }
}