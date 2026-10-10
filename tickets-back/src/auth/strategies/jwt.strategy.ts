import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload, UserLogged } from '../interfaces';
import { i18nMessage } from '../../i18n';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate({ uid }: JwtPayload): Promise<UserLogged> {
    const user = await this.prismaService.user.findUnique({
      where: { id: uid },
      omit: { password: true },
    });

    if (!user || user.isDeleted)
      throw new UnauthorizedException(i18nMessage('errors.invalidCredentials'));
    if (!user.isActive || user.isSystem)
      throw new UnauthorizedException(i18nMessage('errors.userInactive'));

    return user;
  }
}
