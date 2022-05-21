import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  subject: string;
}
