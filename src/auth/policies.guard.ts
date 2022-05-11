import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  applyDecorators,
  UseGuards,
  createParamDecorator,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

export const CHECK_POLICIES_KEY = 'check_policy';

interface IPolicy {
  action: string;
  subject: any;
}

export type CanFunction = (action: string, subject: any) => void;

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policies =
      this.reflector.get<IPolicy[]>(CHECK_POLICIES_KEY, context.getHandler()) ||
      [];

    const { user } = context.switchToHttp().getRequest();

    return policies.every((policy: IPolicy) => {
      if (typeof policy.subject === 'function') {
        return user.ability.can(policy.action, new policy.subject());
      }
      return user.ability.can(policy.action, policy.subject);
    });
  }
}

export function CheckPolicies(...handlers: IPolicy[]) {
  if (handlers.length) {
    return applyDecorators(
      SetMetadata(CHECK_POLICIES_KEY, handlers),
      UseGuards(JwtAuthGuard, PoliciesGuard),
    );
  } else {
    return UseGuards(JwtAuthGuard);
  }
}

export const CheckPolicy = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest();
    return (action: string, subject: any) => {
      if (!user.ability.can(action, subject)) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
    };
  },
);
