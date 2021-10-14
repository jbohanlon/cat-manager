import {
  Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post, Put, UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PatchUserDto } from './dto/patch-user.dto';
import { ReplaceUserDto } from './dto/replace-user.dto';
import { User } from './entities/user.entity';
import { AdminGuard } from './guards/admin.guard';
import { UsersService } from './providers/users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async find(@Param('id') id: number): Promise<User> {
    const user: User = await this.usersService.find(id);

    if (!user) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    const { password, passwordVerification, ...otherFields } = dto;
    const user: User = new User(otherFields);
    user.setPassword(password, passwordVerification);
    return this.usersService.save(user);
  }

  @Put(':id')
  async replace(@Param('id') id: number, @Body() dto: ReplaceUserDto): Promise<User> {
    if (!(await this.usersService.exists(id))) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    if (!Object.keys(dto).length) {
      throw new HttpException('At least one valid property is required for an update.', HttpStatus.BAD_REQUEST);
    }

    const { password, passwordVerification, ...otherFields } = dto;
    const user: User = new User(otherFields);
    user.id = id;
    user.setPassword(password, passwordVerification);
    return this.usersService.save(user);
  }

  @Patch(':id')
  async patch(@Param('id') id: number, @Body() dto: PatchUserDto): Promise<User> {
    const { password, passwordVerification, ...otherFields } = dto;
    const user: User = await this.find(id);
    Object.assign(user, otherFields);
    if (password) {
      user.setPassword(password, passwordVerification);
    }
    return this.usersService.save(user);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(204)
  async delete(@Param('id') id: number): Promise<void> {
    if (!(await this.usersService.exists(id))) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    this.usersService.delete(id);
  }

  @Delete()
  @UseGuards(AdminGuard)
  @HttpCode(204)
  async deleteAll(): Promise<void> {
    this.usersService.deleteAll();
  }
}