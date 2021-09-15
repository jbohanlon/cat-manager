import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ length: 100 })
  name: string;

  @Column('int')
  age: number;

  @Column({ length: 100 })
  breed: string;

  @Column()
  isFriendly: boolean;
}
