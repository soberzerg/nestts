import { ApiProperty } from '@nestjs/swagger';

export class PaginatedRequestDto {
  @ApiProperty({ required: false })
  take: number;

  @ApiProperty({ required: false })
  skip?: number;
}
