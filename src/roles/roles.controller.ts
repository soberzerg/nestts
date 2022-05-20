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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import {
  CanFunction,
  CheckPolicies,
  CheckPolicy,
} from '../auth/policies.guard';
import { Action } from '../auth/actions';
import { Role } from './roles.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { PaginatedResponseDto } from '../general/paginated-response.dto';
import { RoleDto } from './dto/role.dto';
import { PaginatedRequestDto } from '../general/paginated-request.dto';

@Controller('roles')
@ApiTags('roles')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @CheckPolicies({ action: Action.Create, subject: Role })
  @ApiOkResponse({ description: 'Created role data', type: RoleResponseDto })
  async create(@Body() body: CreateRoleDto) {
    const role = await this.rolesService.create(body);

    return { role: role.toPlain() };
  }

  @Get()
  @CheckPolicies({ action: Action.List, subject: Role })
  @ApiOkResponse({
    description: 'List of roles',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(RoleDto) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Query() query: PaginatedRequestDto,
  ): Promise<PaginatedResponseDto<RoleDto>> {
    const { take = 10, skip = 0 } = query;
    const { total, results } = await this.rolesService.findAll({
      take,
      skip,
    });

    return {
      total,
      take,
      skip,
      results: Role.toPlain(results) as RoleDto[],
    };
  }

  @Get(':id')
  @CheckPolicies()
  @ApiOkResponse({ description: 'Got role data', type: RoleResponseDto })
  async findOne(@Param('id') id: string, @CheckPolicy() check: CanFunction) {
    const role = await this.rolesService.findOne(Number(id));

    check(Action.Read, role);

    return { role: role.toPlain() };
  }

  @Patch(':id')
  @CheckPolicies()
  @ApiOkResponse({ description: 'Updated role data', type: RoleResponseDto })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
    @CheckPolicy() check: CanFunction,
  ) {
    const role = await this.rolesService.findOne(Number(id));

    check(Action.Update, role);

    const roleUpdated = await this.rolesService.update(role, body);

    return { role: roleUpdated.toPlain() };
  }

  @Delete(':id')
  @CheckPolicies()
  @ApiOkResponse({ description: 'Removed role data', type: RoleResponseDto })
  async remove(@Param('id') id: string, @CheckPolicy() check: CanFunction) {
    const role = await this.rolesService.findOne(Number(id));

    check(Action.Delete, role);

    const roleRemoved = await this.rolesService.remove(role);

    return { role: roleRemoved.toPlain() };
  }
}
