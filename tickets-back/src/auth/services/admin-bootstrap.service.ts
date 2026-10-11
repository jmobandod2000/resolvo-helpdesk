import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { encryptData } from '../../common/utils/encrypt-data';

// Crea el administrador inicial (LOGIN_*) solo cuando la base no tiene usuarios. Así una instalación nueva arranca sin correr el seed.
@Injectable()
export class AdminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger('AdminBootstrap');

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const users = await this.prismaService.user.count({
      where: { isSystem: false },
    });
    if (users > 0) return;

    const email = this.configService.get<string>('LOGIN_EMAIL').toLowerCase();
    await this.prismaService.user.create({
      data: {
        name: this.configService.get<string>('LOGIN_NAME'),
        email,
        password: await encryptData(
          this.configService.get<string>('LOGIN_PASSWORD'),
        ),
        roles: UserRole.admin,
      },
    });
    this.logger.log(`Administrador inicial creado: ${email}`);
  }
}
