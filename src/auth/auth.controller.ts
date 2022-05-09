import { Controller, Request, Get, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  login(@Request() req) {
    return {
      access_token: this.jwtService.sign({ sub: req.user.id }),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      user: req.user.toPlain(),
    };
  }
}
