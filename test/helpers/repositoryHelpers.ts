import { Repository } from 'typeorm';

export const truncateAndResetAutoIncrement = (repository: Repository<any>, tableName: string) => {
  // Clear out all cats
  // repository.query(`DELETE FROM ${tableName};`);

  repository.createQueryBuilder().delete().from(tableName);

  // Reset auto-increment counter
  // repository.query(`DELETE FROM sqlite_sequence WHERE name='${tableName}';`);
  repository.createQueryBuilder().update('sqlite_sequence').where({ name: tableName }).update({ seq: 0 });
};
