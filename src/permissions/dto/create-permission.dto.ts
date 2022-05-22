import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('permissions')
export class CreatePermissionDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  reason?: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  subject: string;

  @ApiProperty({ required: false })
  ownerField?: string;

  @ApiProperty({ required: false })
  conditions?: object;

  @ApiProperty({ required: false })
  inverted?: boolean;
}
