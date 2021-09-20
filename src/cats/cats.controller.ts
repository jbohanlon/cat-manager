import {
  Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Put, Redirect,
} from '@nestjs/common';
import { CreateOrUpdateCatDto } from './dto/create-or-update-cat.dto';
import { Cat } from './entities/cat.entity';
import { CatsService } from './providers/cats.service';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  async find(@Param('id') id: number): Promise<Cat> {
    const cat: Cat = await this.catsService.find(id);

    if (!cat) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return cat;
  }

  @Post()
  async create(@Body() dto: CreateOrUpdateCatDto): Promise<Cat> {
    const cat: Cat = new Cat();
    Object.assign(cat, dto);
    return this.catsService.save(cat);
  }

  @Put(':id')
  async replace(@Param('id') id: number, @Body() dto: CreateOrUpdateCatDto) {
    const cat: Cat = new Cat();
    Object.assign(cat, dto, { id });
    this.catsService.save(cat);
  }

  @Patch(':id')
  async patch(@Param('id') id: number, @Body() dto: CreateOrUpdateCatDto) {
    const cat: Cat = await this.find(id);
    Object.assign(cat, dto);
    this.catsService.save(cat);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    this.catsService.delete(id);
  }

  @Delete()
  async deleteAll() {
    this.catsService.deleteAll();
  }

  @Get('random')
  @Redirect()
  async redirectToRandomCat() {
    const id = await this.catsService.findRandomId();
    return { url: `/cats/${id}`, statusCode: 302 };
  }
}
