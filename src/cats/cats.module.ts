import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { Connection } from 'typeorm';
import { CatsController } from './cats.controller';
import { Cat } from './entities/cat.entity';
import { CatsService } from './providers/cats.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CatsController],
  providers: [
    {
      provide: 'CAT_REPOSITORY',
      useFactory: (connection: Connection) => connection.getRepository(Cat),
      inject: ['DATABASE_CONNECTION'],
    },
    CatsService,
  ],
})
export class CatsModule {}
