import { Test, TestingModule } from '@nestjs/testing';
import { CvLogsService } from './cv-logs.service';

describe('CvLogsService', () => {
  let service: CvLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CvLogsService],
    }).compile();

    service = module.get<CvLogsService>(CvLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
