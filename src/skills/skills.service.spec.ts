import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';

describe('SkillsService', () => {
  let service: SkillsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        { provide: getRepositoryToken(Skill), useValue: {} },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
