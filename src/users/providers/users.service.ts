import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { id: 'ASC' } });
  }

  async find(id: number): Promise<User> {
    return this.userRepository.findOne(id);
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async exists(id: number): Promise<boolean> {
    return (await this.find(id)) !== undefined;
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async delete(id: number) {
    this.userRepository.delete(id);
  }

  async deleteAll() {
    this.userRepository.clear();
  }
}
