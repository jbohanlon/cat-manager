import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityCreationError, EntityUpdateError } from '../../errors/errors';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async findAll(includeCats: boolean = false): Promise<User[]> {
    return this.userRepository.find({
      order: { id: 'ASC' },
      relations: includeCats ? ['cats'] : undefined,
    });
  }

  async find(id: number, includeCats: boolean = false): Promise<User> {
    return this.userRepository.findOne(id, {
      relations: includeCats ? ['cats'] : undefined,
    });
  }

  async findByEmail(email: string, includeCats: boolean = false): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
      relations: includeCats ? ['cats'] : undefined,
    });
  }

  async exists(id: number): Promise<boolean> {
    return (await this.find(id)) !== undefined;
  }

  async create(user: User): Promise<User> {
    if (user.id) {
      throw new EntityCreationError('Not allowed to specify an id for a new user.');
    }
    await user.validateInstance();
    return this.userRepository.save(user);
  }

  async update(user: User): Promise<User> {
    if (!user.id) {
      throw new EntityUpdateError('Unable to update a user without an id.');
    }
    await user.validateInstance();
    return this.userRepository.save(user);
  }

  async delete(id: number) {
    await this.userRepository.delete(id);
  }

  async deleteAll() {
    await this.userRepository.clear();
  }
}
