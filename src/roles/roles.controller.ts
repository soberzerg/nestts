import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import {
  CanFunction,
  CheckPolicies,
  CheckPolicy,
} from '../auth/policies.guard';
import { Action } from '../auth/actions';
import { Role } from './roles.entity';

@Controller('roles')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @CheckPolicies({ action: Action.Create, subject: Role })
  async create(@Body() body: object) {
    const role = await this.rolesService.create(body);

    return { role: role.toPlain() };
  }

  @Get()
  @CheckPolicies({ action: Action.List, subject: Role })
  async findAll() {
    const roles = await this.rolesService.findAll();

    return Role.toPlain(roles);
  }

  @Get(':id')
  @CheckPolicies()
  async findOne(@Param('id') id: string, @CheckPolicy() check: CanFunction) {
    const role = await this.rolesService.findOne(Number(id));

    check(Action.Read, role);

    return { role: role.toPlain() };
  }

  @Patch(':id')
  @CheckPolicies()
  async update(
    @Param('id') id: string,
    @Body() body: object,
    @CheckPolicy() check: CanFunction,
  ) {
    const role = await this.rolesService.findOne(Number(id));

    check(Action.Update, role);

    const roleUpdated = await this.rolesService.update(role, body);

    return { role: roleUpdated.toPlain() };
  }

  @Delete(':id')
  @CheckPolicies()
  async remove(@Param('id') id: string, @CheckPolicy() check: CanFunction) {
    const role = await this.rolesService.findOne(Number(id));

    check(Action.Delete, role);

    const roleRemoved = await this.rolesService.remove(role);

    return { role: roleRemoved.toPlain() };
  }
}
