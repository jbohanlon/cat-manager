import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';

export class BaseCatDto {
  @Allow()
  name: string;

  @Allow()
  @Transform(({ value }) => parseInt(value, 10))
  weight: number;

  @Allow()
  breed: string;

  @Allow()
  @Transform(({ value }) => (typeof value === 'boolean' ? value : value === 'true'))
  isFriendly: boolean;
}
