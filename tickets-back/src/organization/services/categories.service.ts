import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { i18nMessage } from '../../i18n';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.category.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { Tickets: { where: { isDeleted: false } } } },
      },
    });
  }

  async create(dto: CreateCategoryDto) {
    const name = dto.name.trim();
    await this.assertUniqueName(name);
    return this.prismaService.category.create({
      data: {
        name,
        description: dto.description?.trim() || null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findActiveOrFail(id);
    const name = dto.name?.trim();
    if (name) await this.assertUniqueName(name, id);

    return this.prismaService.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(dto.description !== undefined && {
          description: dto.description?.trim() || null,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: number) {
    await this.findActiveOrFail(id);
    return this.prismaService.category.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
  }

  async assertAssignable(
    categoryId: number | null | undefined,
    currentCategoryId?: number | null,
  ) {
    if (
      categoryId === null ||
      categoryId === undefined ||
      categoryId === currentCategoryId
    )
      return;

    const category = await this.prismaService.category.findFirst({
      where: { id: categoryId, isDeleted: false },
    });
    if (!category)
      throw new BadRequestException(
        i18nMessage('errors.categoryNotFound', { id: categoryId }),
      );
    if (!category.isActive)
      throw new BadRequestException(
        i18nMessage('errors.categoryInactive', { name: category.name }),
      );
  }

  private async findActiveOrFail(id: number) {
    const category = await this.prismaService.category.findFirst({
      where: { id, isDeleted: false },
    });
    if (!category)
      throw new NotFoundException(
        i18nMessage('errors.categoryNotFound', { id }),
      );
    return category;
  }

  private async assertUniqueName(name: string, exceptId?: number) {
    const duplicate = await this.prismaService.category.findFirst({
      where: {
        isDeleted: false,
        name: { equals: name, mode: 'insensitive' },
        ...(exceptId && { id: { not: exceptId } }),
      },
    });
    if (duplicate)
      throw new ConflictException(
        i18nMessage('errors.categoryDuplicate', { name }),
      );
  }
}
