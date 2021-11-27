import { Optional } from '@nestjs/common';
import { Allow } from 'class-validator';
import { MatchesOtherPropertyValue } from '../../custom-validator-decorators/MatchesOtherPropertyValue';

export abstract class BaseUserDto {
  @Allow()
  email: string;

  @Allow()
  isAdmin: boolean;

  @MatchesOtherPropertyValue('password', { message: 'passwordVerification must match password' })
  @Optional()
  passwordVerification: string;
}
