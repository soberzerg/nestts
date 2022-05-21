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
import { PermissionsService } from './permissions.service';
import { Permission } from './permissions.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionDto } from './dto/permission.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
import {
  CanFunction,
  CheckPolicies,
  CheckPolicy,
} from '../auth/policies.guard';
import { Action } from '../auth/actions';
import { PaginatedResponseDto } from '../general/paginated-response.dto';
import { PaginatedRequestDto } from '../general/paginated-request.dto';

@Controller('permissions')
@ApiTags('permissions')
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @CheckPolicies({ action: Action.Create, subject: Permission })
  @ApiOkResponse({
    description: 'Created permission data',
    type: PermissionResponseDto,
  })
  async create(@Body() body: CreatePermissionDto) {
    const permission = await this.permissionsService.create(body);

    return { permission: permission.toPlain() };
  }

  @Get()
  @CheckPolicies({ action: Action.List, subject: Permission })
  @ApiOkResponse({
    description: 'List of permissions',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(PermissionDto) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Query() query: PaginatedRequestDto,
  ): Promise<PaginatedResponseDto<PermissionDto>> {
    const { take = 10, skip = 0 } = query;
    const { total, results } = await this.permissionsService.findAll({
      take,
      skip,
    });

    return {
      total,
      take,
      skip,
      results: Permission.toPlain(results) as PermissionDto[],
    };
  }

  @Get(':id')
  @CheckPolicies()
  @ApiOkResponse({
    description: 'Got permission data',
    type: PermissionResponseDto,
  })
  async findOne(@Param('id') id: string, @CheckPolicy() check: CanFunction) {
    const permission = await this.permissionsService.findOne(Number(id));

    check(Action.Read, permission);

    return { permission: permission.toPlain() };
  }

  @Patch(':id')
  @CheckPolicies()
  @ApiOkResponse({
    description: 'Updated permission data',
    type: PermissionResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePermissionDto,
    @CheckPolicy() check: CanFunction,
  ) {
    const permission = await this.permissionsService.findOne(Number(id));

    check(Action.Update, permission);

    const permissionUpdated = await this.permissionsService.update(
      permission,
      body,
    );

    return { permission: permissionUpdated.toPlain() };
  }

  @Delete(':id')
  @CheckPolicies()
  @ApiOkResponse({
    description: 'Removed permission data',
    type: PermissionResponseDto,
  })
  async remove(@Param('id') id: string, @CheckPolicy() check: CanFunction) {
    const permission = await this.permissionsService.findOne(Number(id));

    check(Action.Delete, permission);

    const permissionRemoved = await this.permissionsService.remove(permission);

    return { permission: permissionRemoved.toPlain() };
  }
}
