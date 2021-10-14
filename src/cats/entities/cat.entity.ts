import {
  IsBoolean, IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, validate,
} from 'class-validator';
import {
  Entity, Column, PrimaryGeneratedColumn, ObjectIdColumn, BeforeInsert, BeforeUpdate, ManyToOne,
} from 'typeorm';
import { InvalidEntityException } from '../../app/exceptions/invalid-entity.exception';
// eslint-disable-next-line import/no-cycle
import { User } from '../../users/entities/user.entity';

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

  @ManyToOne(() => User, (user) => user.cats)
  user: Promise<User>;

  toPojo(): object {
    return { ...this };
  }
}
