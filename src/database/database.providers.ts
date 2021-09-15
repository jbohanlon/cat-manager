import { createConnection } from 'typeorm';
import * as path from 'path';
import { Cat } from 'src/cats/entities/cat.entity';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async () => createConnection({
      type: 'sqlite',
      database: `${path.resolve(__dirname, '..', '..', 'db', 'development.sqlite3')}`,
      entities: [Cat],
      synchronize: true,
    }),
  },
];
