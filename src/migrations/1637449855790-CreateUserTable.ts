/* eslint-disable class-methods-use-this */
import {
  MigrationInterface, QueryRunner, Table, TableIndex,
} from 'typeorm';

export class CreateUserTable1637449855790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'user',
      columns: [
        {
          name: 'id',
          type: 'integer',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        },
        {
          name: 'email',
          type: 'varchar',
          length: '100',
        },
        {
          name: 'encryptedPassword',
          type: 'varchar',
          length: '60',
        },
        {
          name: 'isAdmin',
          type: 'boolean',
        },
      ],
    }), true);

    await queryRunner.createIndex('user', new TableIndex({
      name: 'email_unique',
      columnNames: ['email'],
      isUnique: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user', true);
  }
}
