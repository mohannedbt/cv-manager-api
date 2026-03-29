import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';

@Injectable()
export class CvsService {
  constructor(
    @InjectRepository(Cv)
    private cvRepository: Repository<Cv>,
  ) {}

  async create(createCvDto: CreateCvDto): Promise<Cv> {
    const cv = this.cvRepository.create(createCvDto);
    return this.cvRepository.save(cv);
  }

  async findAll(): Promise<Cv[]> {
    return this.cvRepository.find({ relations: ['user', 'skills'] });
  }

  async findOne(id: number): Promise<Cv|null> {
    return this.cvRepository.findOne({ where: { id }, relations: ['user', 'skills'] });
  }
  async remove(id: number): Promise<void> {
    await this.cvRepository.delete(id);
  }
  async update(id: number, updateCvDto: CreateCvDto): Promise<Cv> {
    await this.cvRepository.update(id, updateCvDto);
    return this.findOne(id) as Promise<Cv>;
  }
  
}