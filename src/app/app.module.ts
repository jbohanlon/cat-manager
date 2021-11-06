import {
  MiddlewareConsumer, Module, NestModule, ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from '../cats/cats.module';
import { UsersModule } from '../users/users.module';
import { AuthenticationMiddleware } from './middleware/authentication.middleware';
import { ensureValidNodeEnv, loadDbConfig } from '../helpers/configHelpers';
import { AuthenticationGuard } from './guards/authentication.guard';

ensureValidNodeEnv();

@Module({
  imports: [
    TypeOrmModule.forRoot(loadDbConfig(process.env.NODE_ENV)),
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
    {
      provide: APP_GUARD,
      useValue: AuthenticationGuard,
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
