import { Connection } from 'typeorm';

export const clearAllTables = async (connection: Connection) => {
  const entityMetadatas = connection.entityMetadatas.map((entityMetadata) => entityMetadata);

  // Sort entity metadatas in a way that ensures that 'Cat' is always sorted before user
  entityMetadatas.sort((a, b) => {
    // Always sort Cat before User
    if (a.name === 'Cat' && b.name === 'User') {
      return -1;
    }

    return 1; // we don't care what the order is for other entity types
  });

  // We want to await async operations in each of the loop iterations, so we're using a for-of loop instead of Array#forEach.
  // It's important that the database tables are truncated in sequence rather than in parallel because of foreign key
  // dependencies (e.g. Cat must be truncated before User).  ESLint doesn't like this, but it's fine because this is
  // just a test helper.
  //
  // eslint-disable-next-line no-restricted-syntax
  for (const entityMetadata of entityMetadatas) {
    const repository = connection.getRepository(entityMetadata.name);
    // eslint-disable-next-line no-await-in-loop
    await repository.clear();
    // eslint-disable-next-line no-await-in-loop
    await repository.createQueryBuilder().update('sqlite_sequence').where({ name: entityMetadata.tableName }).set({ seq: 0 })
      .execute();
  }
};
