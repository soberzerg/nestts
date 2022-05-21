import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './permissions.entity';

@Injectable()
export class PermissionsService {
  create(body: CreatePermissionDto): Promise<Permission> {
    return Permission.fromPlain(body).save();
  }

  async findAll(options?: FindManyOptions<Permission>) {
    const total = await Permission.count(options);
    const results = await Permission.find(options);

    return { total, results };
  }

  async findOne(id: number): Promise<Permission> {
    return Permission.findOneBy({ id });
  }

  async update(
    permission: Permission,
    body: UpdatePermissionDto,
  ): Promise<Permission> {
    Permission.merge(permission, Permission.fromPlain(body));

    return permission.save();
  }

  async remove(permission: Permission): Promise<Permission> {
    return permission.softRemove();
  }
}
