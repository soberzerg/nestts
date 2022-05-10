import { Injectable } from '@nestjs/common';
import { Ability, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { Action } from './actions';
import { User } from './users.entity';
import { instanceToPlain } from 'class-transformer';

type Subjects = InferSubjects<typeof User> | 'all';

@Injectable()
export class CaslAbilityFactory {
  async createForUser(user: User): Promise<Ability> {
    let rules: Array<any> = [];

    if (user.isSuperAdmin) {
      rules = [{ action: Action.Manage, subject: 'all' }];
    } else {
      const roles = await user.roles;
      if (roles) {
        rules = roles.flatMap((role) => instanceToPlain(role.permissions));
      }
    }

    return new Ability(rules, {
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
