import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { DatabaseModel } from '../database/database.model';

@Entity()
export class User extends DatabaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 32 })
  login: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @CreateDateColumn('timestamptz')
  @UpdateDateColumn('timestamptz')
  @DeleteDateColumn('timestamptz')
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
