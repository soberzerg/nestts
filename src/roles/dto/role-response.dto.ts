import { ApiProperty } from '@nestjs/swagger';
import { RoleDto } from './role.dto';

export class RoleResponseDto {
  @ApiProperty()
  role: RoleDto;
}
