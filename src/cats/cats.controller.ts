import {
  Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post, Redirect, Req, UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminGuard } from '../users/guards/admin.guard';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Cat } from './entities/cat.entity';
import { requireCatOwnerOrAdmin } from './catsControllerHelpers';
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
  async create(@Body() dto: CreateCatDto, @Req() req: Request): Promise<Cat> {
    const cat: Cat = new Cat();
    Object.assign(cat, dto);
    cat.user = (req as any).user;
    await this.catsService.create(cat);
    delete cat.user; // We don't want to return the user in the response
    return cat;
  }

  @Patch(':id')
  async patch(@Param('id') id: number, @Body() dto: UpdateCatDto, @Req() req: Request): Promise<Cat> {
    const cat: Cat = await this.catsService.find(id, true);
    if (!cat) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    requireCatOwnerOrAdmin((req as any).user, cat);

    delete cat.user;
    Object.assign(cat, dto);
    return this.catsService.update(cat);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: number, @Req() req: Request): Promise<void> {
    if (!(await this.catsService.exists(id))) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    const cat: Cat = await this.catsService.find(id, true);
    if (!cat) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    requireCatOwnerOrAdmin((req as any).user, cat);

    this.catsService.delete(id);
  }

  @Delete()
  @UseGuards(AdminGuard)
  @HttpCode(204)
  async deleteAll(): Promise<void> {
    this.catsService.deleteAll();
  }
}
