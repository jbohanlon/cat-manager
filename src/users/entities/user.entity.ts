import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import {
  IsBoolean,
  IsEmail, IsNotEmpty, IsString, Length, MaxLength, validate,
} from 'class-validator';
import {
  Column, Entity, Index, ObjectIdColumn, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { InvalidEntityException } from '../../app/exceptions/invalid-entity.exception';
// eslint-disable-next-line import/no-cycle
import { Cat } from '../../cats/entities/cat.entity';
import { PasswordMismatchError } from '../../errors/errors';

export interface UserOptions {
  id?: number,
  email?: string,
  encryptedPassword?: string,
  isAdmin?: boolean,
}

@Entity()
export class User {
  async validateInstance() {
    const validationErrors = await validate(this);
    if (validationErrors.length) {
      throw new InvalidEntityException(validationErrors);
    }
  }

  constructor(options?: UserOptions) {
    if (!options) { return; }
    Object.keys(options).forEach((key) => { this[key] = options[key]; });
  }

  @ObjectIdColumn()
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ length: 100 })
  @MaxLength(100)
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Column({ length: 60 })
  @Length(60, 60)
  @IsString()
  @IsNotEmpty()
  @Exclude()
  encryptedPassword: string;

  @Column()
  @IsBoolean()
  @IsNotEmpty()
  isAdmin: boolean;

  @OneToMany(() => Cat, (cat) => cat.user, { cascade: true })
  cats: Cat[];

  setPassword(password: string, passwordVerification: string) {
    if (password !== passwordVerification) {
      throw new PasswordMismatchError('Password does not match verification password');
    }
    const salt = bcrypt.genSaltSync(10);
    this.encryptedPassword = bcrypt.hashSync(password, salt);
  }

  /**
   * Returns true if the given password, when encrypted, matches the internal encryptedPassword.
   * @param password
   * @return true if match, false if not
   */
  isPasswordMatch(password: string): boolean {
    return bcrypt.compareSync(password, this.encryptedPassword);
  }
}
