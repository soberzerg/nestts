import { Ability } from '@casl/ability';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Action } from './actions';
import { User } from '../users/users.entity';

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
      user.hashedPassword,
    );
    if (!rightPassword) return;

    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const user = await User.findOneBy({ id });
    if (!user) {
      throw new UnauthorizedException();
    }

    let rules: Array<any> = [];

    if (user.isSuperAdmin) {
      rules = [{ action: Action.Manage, subject: 'all' }];
    } else {
      const roles = await user.roles;
      if (roles) {
        rules = roles.flatMap((role) =>
          User.toPlain(role.permissions).map((r) => {
            if (r.ownerField) {
              if (!r.conditions) r.conditions = {};
              r.conditions[r.ownerField] = user.id;
              delete r.ownerField;
            }
            return r;
          }),
        );
      }
    }

    user.ability = new Ability(rules);

    return user;
  }
}
