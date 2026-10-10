import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { i18nMessage } from '../../i18n';
import { UpdatePortalDto, UpsertOrganizationDto } from '../dtos';

const ORGANIZATION_ID = 1;

const emptyToNull = (value?: string | null) => value?.trim() || null;

@Injectable()
export class OrganizationService {
  constructor(private readonly prismaService: PrismaService) {}

  find() {
    return this.prismaService.organization.findUnique({
      where: { id: ORGANIZATION_ID },
    });
  }

  async getPublicProfile() {
    const organization = await this.find();
    return {
      configured: !!organization,
      name: organization?.name ?? null,
      portalEnabled: organization?.portalEnabled ?? false,
    };
  }

  async updatePortal(dto: UpdatePortalDto) {
    const organization = await this.find();
    if (!organization)
      throw new BadRequestException(i18nMessage('errors.organizationMissing'));

    return this.prismaService.organization.update({
      where: { id: ORGANIZATION_ID },
      data: {
        portalEnabled: dto.portalEnabled,
        ...(dto.portalMessage !== undefined && {
          portalMessage: emptyToNull(dto.portalMessage),
        }),
      },
    });
  }

  upsert(dto: UpsertOrganizationDto) {
    const data = {
      name: dto.name.trim(),
      taxId: emptyToNull(dto.taxId),
      email: emptyToNull(dto.email),
      phone: emptyToNull(dto.phone),
      address: emptyToNull(dto.address),
      website: emptyToNull(dto.website),
    };

    return this.prismaService.organization.upsert({
      where: { id: ORGANIZATION_ID },
      create: { id: ORGANIZATION_ID, ...data },
      update: data,
    });
  }
}
