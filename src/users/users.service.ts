import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  async create(body: CreateUserDto): Promise<User> {
    return User.fromPlain(body).save();
  }

  async findAll(options?: FindManyOptions<User>) {
    const total = await User.count(options);
    const results = await User.find(options);

    return { total, results };
  }

  async findOne(id: number): Promise<User> {
    return User.findOneBy({ id });
  }

  async update(user: User, body: UpdateUserDto): Promise<User> {
    user.merge(User.fromPlain(body));

    return user.save();
  }

  async remove(user: User): Promise<User> {
    return user.softRemove();
  }
}
