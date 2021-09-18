import {
  Body, Controller, Get, Post, Redirect,
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

  @Get('random')
  @Redirect()
  async redirectToRandomCat() {
    const id = await this.catsService.findRandomId();
    return { url: `/cats/${id}`, statusCode: 302 };
  }

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.save(createCatDto);
  }
}
