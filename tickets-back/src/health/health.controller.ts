import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  // Usado por el healthcheck de Docker y por `resolvo status`.
  @Get()
  async check() {
    await this.prismaService.$queryRaw`SELECT 1`;
    return { status: 'ok', version: process.env.npm_package_version ?? null };
  }
}
