import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<TData> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  take: number;

  @ApiProperty()
  skip: number;

  results: TData[];
}
