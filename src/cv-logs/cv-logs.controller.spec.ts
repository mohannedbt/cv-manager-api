import { Test, TestingModule } from '@nestjs/testing';
import { CvLogsController } from './cv-logs.controller';
import { CvLogsService } from './cv-logs.service';

describe('CvLogsController', () => {
  let controller: CvLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvLogsController],
      providers: [CvLogsService],
    }).compile();

    controller = module.get<CvLogsController>(CvLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
