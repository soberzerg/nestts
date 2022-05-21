import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
