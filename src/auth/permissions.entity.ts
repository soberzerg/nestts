import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsObject, ValidateIf } from 'class-validator';
import { DatabaseModel } from '../database/database.model';

@Entity()
export class Permission extends DatabaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 32 })
  name: string;

  @Column('text')
  reason: string;

  @Column('varchar', { length: 16 })
  action: string;

  @Column('varchar', { length: 16 })
  subject: string;

  @Column('varchar', { length: 16, nullable: true })
  ownerField: string;

  @Column('jsonb', { nullable: true })
  @ValidateIf((o) => o.conditions === null || o.conditions === undefined)
  @IsObject()
  conditions: any;

  @Column({ default: 'FALSE' })
  inverted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
