import { Connection } from 'typeorm';
import { Cat } from '../entities/cat.entity';

export const catProviders = [
  {
    provide: 'CAT_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Cat),
    inject: ['DATABASE_CONNECTION'],
  },
];
