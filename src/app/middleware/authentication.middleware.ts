import {
  HttpException, HttpStatus, Injectable, NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../../users/providers/users.service';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  // eslint-disable-next-line class-methods-use-this
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization) {
      const base64Credentials = req.headers.authorization.replace(/^Basic /, '');
      const emailAndPasswordDecoded = Buffer.from(base64Credentials, 'base64').toString();
      const [email, password] = emailAndPasswordDecoded.split(':');
      const user = await this.usersService.findByEmail(email);

      if (!user || !user.isPasswordMatch(password)) {
        throw new HttpException('Incorrect username or password', HttpStatus.UNAUTHORIZED);
      }

      (req as any).user = user;
    }
    next();
  }
}
