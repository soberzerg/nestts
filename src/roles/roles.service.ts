import { Injectable } from '@nestjs/common';
import { Role } from './roles.entity';

@Injectable()
export class RolesService {
  async create(body: object): Promise<Role> {
    return Role.fromPlain(body).save();
  }

  async findAll(): Promise<Role[]> {
    return Role.find();
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
