import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { META_ROLES } from '../decorators/role-protected.decorator';
import { UserLogged, ValidRoles } from '../interfaces';
import { i18nMessage } from '../../i18n';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const validRoles: ValidRoles[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles || validRoles.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as UserLogged;

    if (!user) throw new BadRequestException(i18nMessage('errors.notLoggedIn'));
    if (validRoles.includes(user.roles as ValidRoles)) return true;

    throw new ForbiddenException(
      i18nMessage('errors.forbiddenRole', {
        name: user.name,
        roles: validRoles.join(', '),
      }),
    );
  }
}
