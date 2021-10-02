import { IsValidPassword } from '../../custom-validator-decorators/IsValidPassword';
import { BaseUserDto } from './base-user.dto';

export class PatchUserDto extends BaseUserDto {
  @IsValidPassword(false)
  password: string;
}
