import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app/app.module';

export const createApp = async () => {
  // eslint-disable-next-line no-console
  console.log(`Running with NODE_ENV: ${process.env.NODE_ENV}`);
  return NestFactory.create(AppModule);
};
