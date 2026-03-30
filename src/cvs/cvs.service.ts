import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';

type CvFilters = {
  name?: string;
  age?: number;
};

@Injectable()
export class CvsService {
  constructor(
    @InjectRepository(Cv)
    private cvRepository: Repository<Cv>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) {}

  async create(createCvDto: CreateCvDto): Promise<Cv> {
    const { userId, skillIds, ...cvData } = createCvDto;
    const user = await this.resolveUser(userId);
    const skills = await this.resolveSkills(skillIds);

    const cv = this.cvRepository.create(cvData);

    if (user) {
      cv.user = user;
    }

    if (skills !== undefined) {
      cv.skills = skills;
    }

    return this.cvRepository.save(cv);
  }

  async findAll(filters?: CvFilters): Promise<Cv[]> {
    const whereClause: FindOptionsWhere<Cv> = {};

    if (filters?.name) {
      whereClause.name = Like(`%${filters.name}%`);
    }

    if (typeof filters?.age === 'number' && Number.isInteger(filters.age)) {
      whereClause.age = filters.age;
    }

    return this.cvRepository.find({
      where: whereClause,
      relations: ['user', 'skills'],
    });
  }

  async findOne(id: number): Promise<Cv> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['user', 'skills'],
    });

    if (!cv) {
      throw new NotFoundException(`CV with id ${id} not found`);
    }

    return cv;
  }

  async remove(id: number): Promise<void> {
    const result = await this.cvRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`CV with id ${id} not found`);
    }
  }

  async update(id: number, updateCvDto: UpdateCvDto): Promise<Cv> {
    const cv = await this.findOne(id);
    const { userId, skillIds, ...cvData } = updateCvDto;

    Object.assign(cv, cvData);

    if (userId !== undefined) {
      cv.user = await this.resolveUser(userId);
    }

    if (skillIds !== undefined) {
      cv.skills = (await this.resolveSkills(skillIds)) ?? [];
    }

    return this.cvRepository.save(cv);
  }

  private async resolveUser(userId: number): Promise<User>;
  private async resolveUser(userId?: number): Promise<User | undefined>;
  private async resolveUser(userId?: number): Promise<User | undefined> {
    if (userId === undefined) {
      return undefined;
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException(`User with id ${userId} does not exist`);
    }

    return user;
  }

  private async resolveSkills(skillIds?: number[]): Promise<Skill[] | undefined> {
    if (skillIds === undefined) {
      return undefined;
    }

    if (skillIds.length === 0) {
      return [];
    }

    const uniqueSkillIds = [...new Set(skillIds)];
    const skills = await this.skillRepository.find({
      where: { id: In(uniqueSkillIds) },
    });

    if (skills.length !== uniqueSkillIds.length) {
      throw new BadRequestException('One or more provided skills do not exist');
    }

    return skills;
  }
}