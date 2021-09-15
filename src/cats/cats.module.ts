import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { CatsController } from './cats.controller';
import { catProviders } from './providers/cat.provider';
import { CatsService } from './providers/cats.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CatsController],
  providers: [...catProviders, CatsService],
})
export class CatsModule {}
