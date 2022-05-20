import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { Role } from './roles.entity';

@Injectable()
export class RolesService {
  async create(body: object): Promise<Role> {
    return Role.fromPlain(body).save();
  }

  async findAll(options?: FindManyOptions<Role>) {
    const total = await Role.count(options);
    const results = await Role.find(options);

    return { total, results };
  }

  async findOne(id: number): Promise<Role> {
    return Role.findOneBy({ id });
  }

  async update(role: Role, body: object): Promise<Role> {
    Role.merge(role, Role.fromPlain(body));

    return role.save();
  }

  async remove(role: Role): Promise<Role> {
    return role.softRemove();
  }
}
