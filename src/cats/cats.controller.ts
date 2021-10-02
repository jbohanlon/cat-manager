import {
  Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post, Put, Redirect,
} from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
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
  async redirectToRandomCat(): Promise<{ url: string; statusCode: number; }> {
    const id = await this.catsService.findRandomId();
    return { url: `/cats/${id}`, statusCode: 302 };
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
  async create(@Body() dto: CreateCatDto): Promise<Cat> {
    const cat: Cat = new Cat();
    Object.assign(cat, dto);
    return this.catsService.save(cat);
  }

  @Put(':id')
  async replace(@Param('id') id: number, @Body() dto: UpdateCatDto): Promise<Cat> {
    if (!(await this.catsService.exists(id))) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    if (!Object.keys(dto).length) {
      throw new HttpException('At least one valid property is required for an update.', HttpStatus.BAD_REQUEST);
    }

    const cat: Cat = new Cat();
    Object.assign(cat, dto, { id });
    await this.catsService.save(cat);
    return this.catsService.find(id);
  }

  @Patch(':id')
  async patch(@Param('id') id: number, @Body() dto: UpdateCatDto): Promise<Cat> {
    const cat: Cat = await this.find(id);
    Object.assign(cat, dto);
    return this.catsService.save(cat);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: number): Promise<void> {
    if (!(await this.catsService.exists(id))) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    this.catsService.delete(id);
  }

  @Delete()
  @HttpCode(204)
  async deleteAll(): Promise<void> {
    this.catsService.deleteAll();
  }
}
