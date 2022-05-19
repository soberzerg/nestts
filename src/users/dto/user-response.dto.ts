import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class UserResponseDto {
  @ApiProperty()
  user: UserDto;
}
