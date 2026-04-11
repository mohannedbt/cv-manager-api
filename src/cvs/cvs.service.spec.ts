import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CvsService } from './cvs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { AuthenticatedUser } from '../common/interfaces/auth.interface';

type CvRepositoryMock = {
  create: jest.Mock<Cv, [Partial<Cv>]>;
  save: jest.Mock<Promise<Cv>, [Cv]>;
  find: jest.Mock<Promise<Cv[]>, [unknown?]>;
  findOne: jest.Mock<Promise<Cv | null>, [unknown]>;
  delete: jest.Mock<Promise<{ affected?: number | null; raw: unknown }>, [number]>;
};

type UserRepositoryMock = {
  findOne: jest.Mock<Promise<User | null>, [unknown]>;
};

type SkillRepositoryMock = {
  find: jest.Mock<Promise<Skill[]>, [unknown?]>;
};

describe('CvsService', () => {
  let service: CvsService;
  let cvRepository: CvRepositoryMock;
  let userRepository: UserRepositoryMock;
  let skillRepository: SkillRepositoryMock;
  const actor: AuthenticatedUser = { userId: 1, username: 'john', role: 'user' };

  beforeEach(async () => {
    cvRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    userRepository = {
      findOne: jest.fn(),
    };

    skillRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvsService,
        { provide: getRepositoryToken(Cv), useValue: cvRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Skill), useValue: skillRepository },
      ],
    }).compile();

    service = module.get<CvsService>(CvsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a cv with existing user and skills', async () => {
    const dto = {
      name: 'Doe',
      firstname: 'John',
      age: 25,
      cin: 'AA123',
      job: 'Developer',
      userId: 1,
      skillIds: [1, 2],
    };

    const user = { id: 1 } as User;
    const skills = [{ id: 1 }, { id: 2 }] as Skill[];
    const createdCv: Cv = {
      id: 0,
      name: dto.name,
      firstname: dto.firstname,
      age: dto.age,
      cin: dto.cin,
      job: dto.job,
      path: null,
      user: undefined as unknown as User,
      skills: [],
    };
    const savedCv: Cv = { ...createdCv, id: 10, user, skills };

    userRepository.findOne.mockResolvedValue(user);
    skillRepository.find.mockResolvedValue(skills);
    cvRepository.create.mockReturnValue(createdCv);
    cvRepository.save.mockResolvedValue(savedCv);

    const result = await service.create(dto, actor);

    expect(result).toEqual(savedCv);
    expect(cvRepository.create).toHaveBeenCalledWith({
      name: dto.name,
      firstname: dto.firstname,
      age: dto.age,
      cin: dto.cin,
      job: dto.job,
    });
    expect(cvRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        user,
        skills,
      }),
    );
  });

  it('throws BadRequestException when body userId does not match authenticated user', async () => {
    userRepository.findOne.mockResolvedValue({ id: 1 } as User);

    await expect(
      service.create(
        {
          name: 'Doe',
          firstname: 'John',
          age: 25,
          cin: 'AA123',
          job: 'Developer',
          userId: 999,
        },
        actor,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when authenticated user does not exist', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        {
          name: 'Doe',
          firstname: 'John',
          age: 25,
          cin: 'AA123',
          job: 'Developer',
        },
        actor,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when create receives missing skill ids', async () => {
    skillRepository.find.mockResolvedValue([{ id: 1 } as Skill]);

    await expect(
      service.create({
        name: 'Doe',
        firstname: 'John',
        age: 25,
        cin: 'AA123',
        job: 'Developer',
        skillIds: [1, 2],
      }, actor),
    ).rejects.toThrow(BadRequestException);
  });

  it('findAll applies name/age filters and limits regular users to their own cvs', async () => {
    cvRepository.find.mockResolvedValue([]);

    await service.findAll(actor, { name: 'jo', age: 25 });

    expect(cvRepository.find).toHaveBeenCalledWith({
      where: {
        name: expect.objectContaining({ _type: 'like', _value: '%jo%' }),
        age: 25,
        user: { id: actor.userId },
      },
      relations: ['user', 'skills'],
    });
  });

  it('throws NotFoundException when findOne does not find the cv', async () => {
    cvRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(404, actor)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when non-admin tries to access another user cv', async () => {
    cvRepository.findOne.mockResolvedValue({ id: 1, user: { id: 999 } } as Cv);

    await expect(service.findOne(1, actor)).rejects.toThrow(ForbiddenException);
  });

  it('throws NotFoundException when remove does not delete any cv', async () => {
    cvRepository.findOne.mockResolvedValue({ id: 10, user: { id: actor.userId } } as Cv);
    cvRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

    await expect(service.remove(404, actor)).rejects.toThrow(NotFoundException);
  });
});
