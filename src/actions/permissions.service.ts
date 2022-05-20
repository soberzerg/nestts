import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  create(body: CreatePermissionDto) {
    return 'This action adds a new action';
  }

  findAll() {
    return `This action returns all actions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} action`;
  }

  update(id: number, body: UpdatePermissionDto) {
    return `This action updates a #${id} action`;
  }

  remove(id: number) {
    return `This action removes a #${id} action`;
  }
}
