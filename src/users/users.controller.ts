import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CheckPolicies } from '../auth/policies.guard';
import { Action } from '../auth/actions';
import { User } from '../auth/users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @CheckPolicies({ action: Action.List, subject: User })
  async findAll() {
    const users = await this.usersService.findAll();
    return instanceToPlain(users);
  }

  @Get(':id')
  @CheckPolicies()
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findOne(Number(id));

    if (!req.user.ability.can(Action.Read, user)) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

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
