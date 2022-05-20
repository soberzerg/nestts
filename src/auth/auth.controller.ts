import { Controller, Request, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller()
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({
    description:
      'Got access token, to use in "Authorization: Bearer {token}" header',
    type: TokenDto,
  })
  login(@Request() req) {
    return {
      access_token: this.authService.sign(req.user.id),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOkResponse({ description: 'Got user data', type: UserResponseDto })
  @ApiBearerAuth()
  getProfile(@Request() req) {
    return {
      user: req.user.toPlain(),
    };
  }
}
