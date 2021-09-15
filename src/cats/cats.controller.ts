import {
  Body, Controller, Get, Post,
} from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './entities/cat.entity';
import { CatsService } from './providers/cats.service';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.save(createCatDto);
  }
}
