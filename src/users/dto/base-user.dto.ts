import { Optional } from '@nestjs/common';
import { Allow } from 'class-validator';
import { Transform } from 'class-transformer';
import { MatchesOtherPropertyValue } from '../../custom-validator-decorators/MatchesOtherPropertyValue';

export abstract class BaseUserDto {
  @Allow()
  email: string;

  @Allow()
  @Transform(({ value }) => (typeof value === 'boolean' ? value : value === 'true'))
  isAdmin: boolean;

  @MatchesOtherPropertyValue('password', { message: 'passwordVerification must match password' })
  @Optional()
  passwordVerification: string;

  @Allow()
  password: string;
}
