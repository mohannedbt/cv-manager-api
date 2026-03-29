import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User|null> {
    return this.userRepository.findOne({ where: { id } });
  }
  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
  async update(id: number, updateUserDto: CreateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id) as Promise<User>;
  }
}