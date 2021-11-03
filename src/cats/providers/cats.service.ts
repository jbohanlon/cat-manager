import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityCreationError, EntityUpdateError } from '../../errors/errors';
import { Cat } from '../entities/cat.entity';

@Injectable()
export class CatsService {
  constructor(@InjectRepository(Cat) private catRepository: Repository<Cat>) {}

  async findAll(includeOwner: boolean = false): Promise<Cat[]> {
    return this.catRepository.find({
      order: { id: 'ASC' },
      relations: includeOwner ? ['user'] : undefined,
    });
  }

  async find(id: number, includeOwner: boolean = false): Promise<Cat> {
    return this.catRepository.findOne(id, {
      relations: includeOwner ? ['user'] : undefined,
    });
  }

  async exists(id: number): Promise<boolean> {
    return (await this.find(id)) !== undefined;
  }

  async create(cat: Cat): Promise<Cat> {
    if (cat.id) {
      throw new EntityCreationError('Not allowed to specify an id for a new cat.');
    }
    await cat.validateInstance();
    return this.catRepository.save(cat);
  }

  async update(cat: Cat): Promise<Cat> {
    if (!cat.id) {
      throw new EntityUpdateError('Unable to update a cat without an id.');
    }
    await cat.validateInstance();
    return this.catRepository.save(cat);
  }

  async delete(id: number) {
    await this.catRepository.delete(id);
  }

  async deleteAll() {
    await this.catRepository.clear();
  }

  async findRandomId(): Promise<number> {
    // Note: The RANDOM() function only works with sqlite
    const builtQuery = this.catRepository.createQueryBuilder().select(['id']).orderBy('RANDOM()');
    const randomId = (await builtQuery.getRawOne()).id;
    return randomId;
  }
}
