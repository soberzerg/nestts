import { ApiProperty } from '@nestjs/swagger';
import { PermissionDto } from './permission.dto';

export class PermissionResponseDto {
  @ApiProperty()
  permission: PermissionDto;
}
