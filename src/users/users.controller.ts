import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CheckPolicies, CheckPolicy } from '../auth/policies.guard';
import { Action } from '../auth/actions';
import { User } from '../auth/users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @CheckPolicies({ action: Action.Create, subject: User })
  async create(@Body() body: object) {
    const user = await this.usersService.create(body);

    return { user: user.toPlain() };
  }

  @Get()
  @CheckPolicies({ action: Action.List, subject: User })
  async findAll() {
    const users = await this.usersService.findAll();
    return instanceToPlain(users);
  }

  @Get(':id')
  @CheckPolicies()
  async findOne(@Param('id') id: string, @CheckPolicy() check) {
    const user = await this.usersService.findOne(Number(id));

    check(Action.Read, user);

    return { user: user.toPlain() };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
