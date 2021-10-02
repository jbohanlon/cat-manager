import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@Inject('USER_REPOSITORY') private userRepository: Repository<User>) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async find(id: number): Promise<User> {
    return this.userRepository.findOne(id);
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
