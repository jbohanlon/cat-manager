import { IsValidPassword } from '../../custom-validator-decorators/IsValidPassword';
import { BaseUserDto } from './base-user.dto';

export class CreateUserDto extends BaseUserDto {
  @IsValidPassword(true)
  password: string;
}
