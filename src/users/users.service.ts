import { Injectable } from '@nestjs/common';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  async create(body: object): Promise<User> {
    return User.fromPlain(body).save();
  }

  async findAll(): Promise<User[]> {
    return User.find();
  }

  async findOne(id: number): Promise<User> {
    return User.findOneBy({ id });
  }

  async update(user: User, body: object): Promise<User> {
    user.merge(User.fromPlain(body));

    return user.save();
  }

  async remove(user: User): Promise<User> {
    return user.softRemove();
  }
}
