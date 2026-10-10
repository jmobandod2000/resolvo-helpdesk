import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { i18nMessage } from '../../i18n';

export const GetUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user)
      throw new InternalServerErrorException(
        i18nMessage('errors.userNotInRequest'),
      );

    return field ? user[field] : user;
  },
);
