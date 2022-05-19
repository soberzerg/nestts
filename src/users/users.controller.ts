import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CanFunction,
  CheckPolicies,
  CheckPolicy,
} from '../auth/policies.guard';
import { Action } from '../auth/actions';
import { PaginatedResponseDto } from '../general/paginated-response.dto';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @CheckPolicies({ action: Action.Create, subject: User })
  @ApiOkResponse({ description: 'Created user data', type: UserResponseDto })
  async create(@Body() body: CreateUserDto) {
    const user = await this.usersService.create(body);

    return { user: user.toPlain() };
  }

  @Get()
  @CheckPolicies({ action: Action.List, subject: User })
  @ApiOkResponse({
    description: 'List of users',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(UserDto) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Query('offset') offset = 0,
    @Query('limit') limit = 10,
  ): Promise<PaginatedResponseDto<UserDto>> {
    const { total, results } = await this.usersService.findAll({
      take: limit,
      skip: offset,
    });

    return {
      total,
      limit,
      offset,
      results: User.toPlain(results) as UserDto[],
    };
  }

  @Get(':id')
  @CheckPolicies()
  @ApiOkResponse({ description: 'Got user data', type: UserResponseDto })
  async findOne(@Param('id') id: string, @CheckPolicy() check: CanFunction) {
    const user = await this.usersService.findOne(Number(id));

    check(Action.Read, user);

    return { user: user.toPlain() };
  }

  @Patch(':id')
  @CheckPolicies()
  @ApiOkResponse({ description: 'Updated user data', type: UserResponseDto })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @CheckPolicy() check: CanFunction,
  ) {
    const user = await this.usersService.findOne(Number(id));

    check(Action.Update, user);

    const userUpdated = await this.usersService.update(user, body);

    return { user: userUpdated.toPlain() };
  }

  @Delete(':id')
  @CheckPolicies()
  @ApiOkResponse({ description: 'Removed user data', type: UserResponseDto })
  async remove(@Param('id') id: string, @CheckPolicy() check: CanFunction) {
    const user = await this.usersService.findOne(Number(id));

    check(Action.Delete, user);

    const userRemoved = await this.usersService.remove(user);

    return { user: userRemoved.toPlain() };
  }
}
