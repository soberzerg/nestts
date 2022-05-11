import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CanFunction,
  CheckPolicies,
  CheckPolicy,
} from '../auth/policies.guard';
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

    return User.toPlain(users);
  }

  @Get(':id')
  @CheckPolicies()
  async findOne(@Param('id') id: string, @CheckPolicy() check: CanFunction) {
    const user = await this.usersService.findOne(Number(id));

    check(Action.Read, user);

    return { user: user.toPlain() };
  }

  @Patch(':id')
  @CheckPolicies()
  async update(
    @Param('id') id: string,
    @Body() body: object,
    @CheckPolicy() check: CanFunction,
  ) {
    const user = await this.usersService.findOne(Number(id));

    check(Action.Update, user);

    const userUpdated = await this.usersService.update(user, body);

    return { user: userUpdated.toPlain() };
  }

  @Delete(':id')
  @CheckPolicies()
  async remove(@Param('id') id: string, @CheckPolicy() check: CanFunction) {
    const user = await this.usersService.findOne(Number(id));

    check(Action.Delete, user);

    const userRemoved = await this.usersService.remove(user);

    return { user: userRemoved.toPlain() };
  }
}
