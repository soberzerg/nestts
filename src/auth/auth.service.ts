import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from './users.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(login: string, plainPassword: string): Promise<any> {
    const user = await User.findOneBy({ login });
    if (!user) return;

    const rightPassword = await User.comparePassword(
      plainPassword,
      user.password,
    );
    if (!rightPassword) return;

    return user.toPlain();
  }

  async login(user: any) {
    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUser(id: number) {
    const user = await User.findOneBy({ id });
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      user: user.toPlain(),
    };
  }
}
