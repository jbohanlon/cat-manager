import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cat } from '../entities/cat.entity';

@Injectable()
export class CatsService {
  constructor(@Inject('CAT_REPOSITORY') private catsRepository: Repository<Cat>) {}

  async findAll(): Promise<Cat[]> {
    return this.catsRepository.find();
  }

  async save(cat: Cat) {
    this.catsRepository.save(cat);
  }
}
