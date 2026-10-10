import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../../prisma/prisma.service';
import { compareData } from '../../common/utils/encrypt-data';
import { LoginUserDto } from '../dtos';
import { JwtPayload, UserLogged } from '../interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.isDeleted || !user.isActive)
      throw new UnauthorizedException('Credentials invalid');

    const { password: hashedPassword, ...userLogged } = user;

    const isCorrectPassword = await compareData(password, hashedPassword);
    if (!isCorrectPassword)
      throw new UnauthorizedException('Credentials invalid');

    return this.buildAuthResponse(userLogged);
  }

  checkAuthToken(user: UserLogged) {
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: UserLogged) {
    return { ...user, jwt: this.getJsonWebToken({ uid: user.id }) };
  }

  private getJsonWebToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
