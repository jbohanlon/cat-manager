/* eslint-disable class-methods-use-this */
import {
  MigrationInterface, QueryRunner, TableColumn, TableForeignKey,
} from 'typeorm';

export class AddUserIdToCatTable1637449868389 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('cat', new TableColumn({
      name: 'userId',
      type: 'integer',
    }));

    await queryRunner.createForeignKey(
      'cat',
      new TableForeignKey({
        name: 'userIdForeignKey',
        columnNames: ['userId'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'cascade',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const userIdForeignKey = (await queryRunner.getTable('cat'))
      .foreignKeys.find((foreignKey) => { return foreignKey.columnNames.length === 1 && foreignKey.columnNames[0] === 'userId'; });
    await queryRunner.dropForeignKey('cat', userIdForeignKey);
    await queryRunner.dropColumn('cat', 'userId');
  }
}
