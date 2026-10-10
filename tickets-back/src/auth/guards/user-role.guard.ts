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

    if (!user) throw new BadRequestException('User is not logged in');
    if (validRoles.includes(user.roles as ValidRoles)) return true;

    throw new ForbiddenException(
      `User ${user.name} does not have the required roles: ${validRoles.join(', ')}`,
    );
  }
}
