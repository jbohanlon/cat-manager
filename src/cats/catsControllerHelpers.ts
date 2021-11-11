import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Cat } from './entities/cat.entity';

export const requireCatOwnerOrAdmin = (user: User, cat: Cat): void => {
  if (user.isAdmin || cat.user.id === user.id) {
    return;
  }
  throw new HttpException('A cat may only be deleted by its owner or an admin', HttpStatus.FORBIDDEN);
};
