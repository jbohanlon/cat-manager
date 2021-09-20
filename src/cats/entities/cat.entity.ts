import {
  IsBoolean, IsInt, IsNotEmpty, IsPositive, IsString, validate,
} from 'class-validator';
import {
  Entity, Column, PrimaryGeneratedColumn, ObjectIdColumn, BeforeInsert, BeforeUpdate,
} from 'typeorm';
import { InvalidEntityException } from '../../app/exceptions/invalid-entity.exception';

@Entity()
export class Cat {
  @BeforeInsert()
  @BeforeUpdate()
  async validateInstance() {
    const validationErrors = await validate(this);
    if (validationErrors.length) {
      throw new InvalidEntityException(validationErrors);
    }
  }

  @ObjectIdColumn()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column('int')
  @IsPositive()
  @IsInt()
  @IsNotEmpty()
  weight: number;

  @Column({ length: 100 })
  @IsString()
  @IsNotEmpty()
  breed: string;

  @Column()
  @IsBoolean()
  @IsNotEmpty()
  isFriendly: boolean;
}
