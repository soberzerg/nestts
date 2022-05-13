import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  SaveOptions,
  DeepPartial,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { Ability } from '@casl/ability';
import { DatabaseModel } from '../database/database.model';
import { Role } from '../auth/roles.entity';

@Entity()
export class User extends DatabaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 32 })
  login: string;

  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  hashedPassword: string;

  @Column({ default: 'FALSE' })
  isSuperAdmin: boolean;

  @ManyToMany(() => Role)
  @JoinTable()
  @Exclude({ toPlainOnly: true })
  roles: Promise<Role[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Exclude({ toPlainOnly: true })
  ability: Ability;

  async save(options?: SaveOptions): Promise<this> {
    if (this.password) {
      this.hashedPassword = await User.hashPassword(this.password);
      this.password = undefined;
    }

    return super.save(options);
  }

  merge(entityLike: DeepPartial<User>): User {
    const user = User.merge(this, entityLike);
    if (entityLike.password) {
      user.password = entityLike.password;
    }

    return user;
  }

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

  static async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, function (err, salt) {
        if (err) {
          reject(err);
        } else {
          bcrypt.hash(password, salt, (err, hash) =>
            err ? reject(err) : resolve(hash),
          );
        }
      });
    });
  }
}
