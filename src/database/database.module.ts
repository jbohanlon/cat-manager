import { Module } from '@nestjs/common';
import * as path from 'path';
import { Cat } from 'src/cats/entities/cat.entity';
import { createConnection } from 'typeorm';

const databaseConnectionProvider = {
  provide: 'DATABASE_CONNECTION',
  useFactory: async () => {
    const nodeEnv = process.env.NODE_ENV;

    if (!['development', 'test', 'production'].includes(nodeEnv) || !nodeEnv) {
      throw new Error(`Invalid NODE_ENV specified. (Got NODE_ENV=${nodeEnv})`);
    }

    return createConnection({
      type: 'sqlite',
      database: `${path.resolve(__dirname, '..', '..', 'db', `${nodeEnv}.sqlite3`)}`,
      entities: [Cat],
      synchronize: nodeEnv !== 'production',
    });
  },
};

@Module({
  providers: [databaseConnectionProvider],
  exports: [databaseConnectionProvider],
})
export class DatabaseModule {}
