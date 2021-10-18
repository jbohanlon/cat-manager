import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

const nodeEnv = process.env.NODE_ENV;

if (!['development', 'test', 'production'].includes(nodeEnv) || !nodeEnv) {
  throw new Error(`Invalid NODE_ENV specified. (Got NODE_ENV=${nodeEnv})`);
}

// eslint-disable-next-line no-console
console.log(`Running with NODE_ENV: ${nodeEnv}`);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
