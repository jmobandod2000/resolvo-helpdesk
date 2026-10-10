import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { i18nMessage } from '../../i18n';
import { CreateSiteDto, UpdateSiteDto } from '../dtos';

@Injectable()
export class SitesService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.site.findMany({
      where: { isDeleted: false },
      orderBy: [{ code: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { Tickets: { where: { isDeleted: false } } } },
      },
    });
  }

  async create(dto: CreateSiteDto) {
    const name = dto.name.trim();
    await this.assertUniqueName(name);
    return this.prismaService.site.create({
      data: {
        name,
        code: dto.code?.trim() || null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: number, dto: UpdateSiteDto) {
    await this.findActiveOrFail(id);
    const name = dto.name?.trim();
    if (name) await this.assertUniqueName(name, id);

    return this.prismaService.site.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(dto.code !== undefined && { code: dto.code?.trim() || null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: number) {
    await this.findActiveOrFail(id);
    return this.prismaService.site.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
  }

  async assertAssignable(
    siteId: number | null | undefined,
    currentSiteId?: number | null,
  ) {
    if (siteId === null || siteId === undefined || siteId === currentSiteId)
      return;

    const site = await this.prismaService.site.findFirst({
      where: { id: siteId, isDeleted: false },
    });
    if (!site)
      throw new BadRequestException(
        i18nMessage('errors.siteNotFound', { id: siteId }),
      );
    if (!site.isActive)
      throw new BadRequestException(
        i18nMessage('errors.siteInactive', { name: site.name }),
      );
  }

  private async findActiveOrFail(id: number) {
    const site = await this.prismaService.site.findFirst({
      where: { id, isDeleted: false },
    });
    if (!site)
      throw new NotFoundException(i18nMessage('errors.siteNotFound', { id }));
    return site;
  }

  private async assertUniqueName(name: string, exceptId?: number) {
    const duplicate = await this.prismaService.site.findFirst({
      where: {
        isDeleted: false,
        name: { equals: name, mode: 'insensitive' },
        ...(exceptId && { id: { not: exceptId } }),
      },
    });
    if (duplicate)
      throw new ConflictException(
        i18nMessage('errors.siteDuplicate', { name }),
      );
  }
}
