import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  ownerField: string;

  @ApiProperty()
  conditions: object;

  @ApiProperty()
  inverted: boolean;
}
