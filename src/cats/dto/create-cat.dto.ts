import { Transform } from 'class-transformer';
import {
  IsString, IsInt, IsBoolean, IsNotEmpty,
} from 'class-validator';

export class CreateCatDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  age: number;

  @IsString()
  @IsNotEmpty()
  breed: string;

  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'boolean' ? value : value === 'true'))
  isFriendly: boolean;
}
