import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from '../../auth/decorators';
import { ValidRoles } from '../../auth/interfaces';
import { OrganizationService } from '../services';
import { UpdatePortalDto, UpsertOrganizationDto } from '../dtos';
import { PortalAccessDto } from '../../portal/dtos/portal-access.dto';
import { RequesterMailService } from '../../mail/services';
import { resolveLanguage } from '../../i18n';

@ApiTags('Organization')
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly requesterMailService: RequesterMailService,
  ) {}

  @Get('public')
  getPublicProfile() {
    return this.organizationService.getPublicProfile();
  }

  @Get()
  @Auth()
  find() {
    return this.organizationService.find();
  }

  @Patch('portal')
  @Auth(ValidRoles.ADMIN)
  updatePortal(@Body() dto: UpdatePortalDto) {
    return this.organizationService.updatePortal(dto);
  }

  @Get('portal/mail-status')
  @Auth(ValidRoles.ADMIN)
  getMailStatus() {
    return {
      configured: this.requesterMailService.isEnabled(),
      from: this.requesterMailService.from || null,
      appUrl: this.requesterMailService.appUrl || null,
    };
  }

  @Post('portal/test-email')
  @Auth(ValidRoles.ADMIN)
  async sendTestEmail(
    @Body() dto: PortalAccessDto,
    @Headers('x-lang') lang?: string,
  ) {
    const sent = await this.requesterMailService.sendTest(
      dto.email,
      resolveLanguage(lang),
    );
    return { sent };
  }

  @Put()
  @Auth(ValidRoles.ADMIN)
  upsert(@Body() dto: UpsertOrganizationDto) {
    return this.organizationService.upsert(dto);
  }
}
