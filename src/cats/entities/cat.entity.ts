import {
  IsBoolean, IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, validate,
} from 'class-validator';
import {
  Entity, Column, PrimaryGeneratedColumn, ObjectIdColumn, BeforeInsert, BeforeUpdate,
} from 'typeorm';
import { InvalidEntityException } from '../../app/exceptions/invalid-entity.exception';

interface CatOptions {
  id?: number,
  name?: string,
  weight?: number,
  breed?: string,
  isFriendly?: boolean
}

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

  constructor(options?: CatOptions) {
    if (!options) { return; }
    Object.keys(options).forEach((key) => { this[key] = options[key]; });
  }

  @ObjectIdColumn()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column('int')
  @IsPositive()
  @IsInt()
  @IsNotEmpty()
  weight: number;

  @Column({ length: 100 })
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  breed: string;

  @Column()
  @IsBoolean()
  @IsNotEmpty()
  isFriendly: boolean;

  toPojo(): object {
    return { ...this };
  }
}
