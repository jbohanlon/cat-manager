import { Repository } from 'typeorm';

export const truncateAndResetAutoIncrement = (repository: Repository<any>, tableName: string) => {
  // Clear out all cats
  repository.createQueryBuilder().delete().from(tableName).execute();

  // Reset auto-increment counter
  repository.createQueryBuilder().update('sqlite_sequence').where({ name: tableName }).set({ seq: 0 })
    .execute();
};
