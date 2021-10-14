/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app/app.module';

export const createApp = async () => {
  // If NODE_ENV hasn't been set, default to 'development' environment
  process.env.NODE_ENV ||= 'development';
  console.log(`Running with NODE_ENV: ${process.env.NODE_ENV}`);
  return NestFactory.create(AppModule);
};
