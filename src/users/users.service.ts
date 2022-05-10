import { Injectable } from '@nestjs/common';
import { User } from '../auth/users.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  async create(body: object): Promise<User> {
    const user = User.fromPlain(body);

    await user.save();

    return user;
  }

  async findAll(): Promise<User[]> {
    return User.find();
  }

  async findOne(id: number): Promise<User> {
    return User.findOneBy({ id });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
