import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { encryptData } from '../../common/utils/encrypt-data';
import { CreateUserDto, UpdateUserDto } from '../dtos';
import { i18nMessage } from '../../i18n';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.user.findMany({
      where: { isDeleted: false },
      omit: { password: true },
      orderBy: { name: 'asc' },
    });
  }

  async create({ password, email, ...userData }: CreateUserDto) {
    return this.prismaService.user.create({
      data: {
        ...userData,
        email: email.toLowerCase(),
        password: await encryptData(password),
      },
      omit: { password: true },
    });
  }

  async update(id: number, { password, email, ...userData }: UpdateUserDto) {
    await this.findActiveOrFail(id);

    return this.prismaService.user.update({
      where: { id },
      data: {
        ...userData,
        ...(email && { email: email.toLowerCase() }),
        ...(password && { password: await encryptData(password) }),
      },
      omit: { password: true },
    });
  }

  async remove(id: number) {
    await this.findActiveOrFail(id);

    return this.prismaService.user.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
      omit: { password: true },
    });
  }

  private async findActiveOrFail(id: number) {
    const user = await this.prismaService.user.findFirst({
      where: { id, isDeleted: false },
    });
    if (!user)
      throw new NotFoundException(i18nMessage('errors.userNotFound', { id }));
    return user;
  }
}
