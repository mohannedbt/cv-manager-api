import {
  BadRequestException,
  ForbiddenException,
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
import { AuthenticatedUser } from '../common/interfaces/auth.interface';
import { SseService } from '../sse/sse.service';

type CvFilters = {
  name?: string;
  age?: number;
};

@Injectable()
export class CvsService {
  constructor(
    private readonly sseService: SseService,
    @InjectRepository(Cv)
    private cvRepository: Repository<Cv>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) {}

  // =========================
  // CREATE CV (FIXED SSE FLOW)
  // =========================
  async create(
    createCvDto: CreateCvDto,
    actor: AuthenticatedUser,
  ): Promise<Cv> {
    const { userId, skillIds, ...cvData } = createCvDto;

    // enforce ownership = logged user
    const user = await this.resolveUser(actor.userId);
    const skills = await this.resolveSkills(skillIds);

    if (userId !== undefined && userId !== actor.userId) {
      throw new BadRequestException('CV owner must match authenticated user');
    }

    const cv = this.cvRepository.create(cvData);
    cv.user = user;

    if (skills) {
      cv.skills = skills;
    }

    // ✅ STEP 1: SAVE FIRST (IMPORTANT FIX)
    const savedCv = await this.cvRepository.save(cv);

    // ✅ STEP 2: THEN EMIT SSE EVENT
    this.sseService.publish({
      type: 'CV_CREATED',
      cvId: savedCv.id,
      ownerId: savedCv.user.id,
      payload: savedCv,
    });

    return savedCv;
  }

  // =========================
  // FIND ALL CVs
  // =========================
  async findAll(actor: AuthenticatedUser, filters?: CvFilters): Promise<Cv[]> {
    const whereClause: FindOptionsWhere<Cv> = {};

    if (filters?.name) {
      whereClause.name = Like(`%${filters.name}%`);
    }

    if (typeof filters?.age === 'number' && Number.isInteger(filters.age)) {
      whereClause.age = filters.age;
    }

    // admin sees all, user sees only theirs
    if (actor.role !== 'admin') {
      whereClause.user = { id: actor.userId };
    }

    return this.cvRepository.find({
      where: whereClause,
      relations: ['user', 'skills'],
    });
  }

  // =========================
  // FIND ONE
  // =========================
  async findOne(id: number, actor: AuthenticatedUser): Promise<Cv> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['user', 'skills'],
    });

    if (!cv) {
      throw new NotFoundException(`CV with id ${id} not found`);
    }

    if (actor.role !== 'admin' && cv.user?.id !== actor.userId) {
      throw new ForbiddenException('You can only access your own CVs');
    }

    return cv;
  }

  // =========================
  // UPDATE CV
  // =========================
  async update(
    id: number,
    updateCvDto: UpdateCvDto,
    actor: AuthenticatedUser,
  ): Promise<Cv> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['user', 'skills'],
    });

    if (!cv) {
      throw new NotFoundException(`CV with id ${id} not found`);
    }

    if (cv.user?.id !== actor.userId) {
      throw new ForbiddenException('Only the creator can update this CV');
    }

    const { userId, skillIds, ...cvData } = updateCvDto;

    if (userId !== undefined && userId !== cv.user?.id) {
      throw new BadRequestException('Changing CV owner is not allowed');
    }

    Object.assign(cv, cvData);

    if (skillIds !== undefined) {
      cv.skills = await this.resolveSkills(skillIds) ?? [];
    }

    // save update
    const updatedCv = await this.cvRepository.save(cv);

    // SSE EVENT
    this.sseService.publish({
      type: 'CV_UPDATED',
      cvId: updatedCv.id,
      ownerId: updatedCv.user.id,
      payload: updatedCv,
    });

    return updatedCv;
  }

  // =========================
  // DELETE CV
  // =========================
  async remove(id: number, actor: AuthenticatedUser): Promise<void> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!cv) {
      throw new NotFoundException(`CV with id ${id} not found`);
    }

    if (cv.user?.id !== actor.userId) {
      throw new ForbiddenException('Only the creator can delete this CV');
    }

    await this.cvRepository.delete(id);

    // SSE EVENT
    this.sseService.publish({
      type: 'CV_DELETED',
      cvId: cv.id,
      ownerId: cv.user.id,
      payload: cv,
    });
  }

  // =========================
  // HELPERS
  // =========================
  private async resolveUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException(`User with id ${userId} does not exist`);
    }

    return user;
  }

  private async resolveSkills(skillIds?: number[]): Promise<Skill[] | undefined> {
    if (!skillIds) return undefined;
    if (skillIds.length === 0) return [];

    const uniqueSkillIds = [...new Set(skillIds)];

    const skills = await this.skillRepository.find({
      where: { id: In(uniqueSkillIds) },
    });

    if (skills.length !== uniqueSkillIds.length) {
      throw new BadRequestException('One or more skills do not exist');
    }

    return skills;
  }
}