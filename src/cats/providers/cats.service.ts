import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cat } from '../entities/cat.entity';

@Injectable()
export class CatsService {
  constructor(@Inject('CAT_REPOSITORY') private catsRepository: Repository<Cat>) {}

  async findAll(): Promise<Cat[]> {
    return this.catsRepository.find();
  }

  async find(id: number): Promise<Cat> {
    return this.catsRepository.findOne(id);
  }

  async save(cat: Cat): Promise<Cat> {
    return this.catsRepository.save(cat);
  }

  async delete(id: number) {
    this.catsRepository.delete(id);
  }

  async deleteAll() {
    this.catsRepository.clear();
  }

  async findRandomId(): Promise<number> {
    // Note: The RANDOM() function only works with sqlite
    const builtQuery = this.catsRepository.createQueryBuilder().select(['id']).orderBy('RANDOM()');
    return (await builtQuery.getRawOne()).id;
  }
}
