import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

console.log(`Running with NODE_ENV: ${process.env.NODE_ENV}`);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
