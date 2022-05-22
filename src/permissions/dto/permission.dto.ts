import { ApiProperty } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';

export class PermissionDto extends CreatePermissionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;
}
