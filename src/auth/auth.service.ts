import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './users.entity';

@Injectable()
export class AuthService {
  async validateUser(
    login: string,
    plainPassword: string,
  ): Promise<User | undefined> {
    const user = await User.findOneBy({ login });
    if (!user) return;

    const rightPassword = await User.comparePassword(
      plainPassword,
      user.password,
    );
    if (!rightPassword) return;

    return user;
  }

  async getUser(id: number) {
    const user = await User.findOneBy({ id });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
