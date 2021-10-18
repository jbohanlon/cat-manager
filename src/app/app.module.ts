import {
  MiddlewareConsumer, Module, NestModule, ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from '../cats/cats.module';
import { UsersModule } from '../users/users.module';
import { AuthenticationMiddleware } from './middleware/authentication.middleware';
import { Cat } from '../cats/entities/cat.entity';
import { User } from '../users/entities/user.entity';

const nodeEnv = process.env.NODE_ENV;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: `${path.resolve(__dirname, '..', '..', 'db', `${nodeEnv}.sqlite3`)}`,
      entities: [Cat, User],
      synchronize: nodeEnv !== 'production',
    }),
    CatsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, transform: true }),
    },
  ],
})
export class AppModule implements NestModule {
  // eslint-disable-next-line class-methods-use-this
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes('*');
  }
}
