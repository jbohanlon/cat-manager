import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cat } from '../entities/cat.entity';

@Injectable()
export class CatsService {
  constructor(@Inject('CAT_REPOSITORY') private catRepository: Repository<Cat>) {}

  async findAll(): Promise<Cat[]> {
    return this.catRepository.find();
  }

  async find(id: number): Promise<Cat> {
    return this.catRepository.findOne(id);
  }

  async exists(id: number): Promise<boolean> {
    return (await this.find(id)) !== undefined;
  }

  async save(cat: Cat): Promise<Cat> {
    return this.catRepository.save(cat);
  }

  async delete(id: number) {
    this.catRepository.delete(id);
  }

  async deleteAll() {
    this.catRepository.clear();
  }

  async findRandomId(): Promise<number> {
    // Note: The RANDOM() function only works with sqlite
    const builtQuery = this.catRepository.createQueryBuilder().select(['id']).orderBy('RANDOM()');
    const randomId = (await builtQuery.getRawOne()).id;
    return randomId;
  }
}
