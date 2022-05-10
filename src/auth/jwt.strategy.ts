import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { AuthService } from './auth.service';
import { User } from './users.entity';
import { Action } from './actions';
import { instanceToPlain } from 'class-transformer';
import { Ability } from '@casl/ability';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.authService.getUser(payload.sub);

    let rules: Array<any> = [];

    if (user.isSuperAdmin) {
      rules = [{ action: Action.Manage, subject: 'all' }];
    } else {
      const roles = await user.roles;
      if (roles) {
        rules = roles.flatMap((role) =>
          instanceToPlain(role.permissions).map((r) => {
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
