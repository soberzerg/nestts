import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { DatabaseModel } from '../database/database.model';
import { Role } from './roles.entity';

@Entity()
export class User extends DatabaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 32 })
  login: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ default: 'FALSE' })
  isSuperAdmin: boolean;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Promise<Role[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, (err, result) =>
        err ? reject(err) : resolve(result),
      );
    });
  }
}
