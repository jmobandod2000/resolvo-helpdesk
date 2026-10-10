import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from '../../auth/decorators';
import { ValidRoles } from '../../auth/interfaces';
import { OrganizationService } from '../services';
import { UpdatePortalDto, UpsertOrganizationDto } from '../dtos';

@ApiTags('Organization')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

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

  @Put()
  @Auth(ValidRoles.ADMIN)
  upsert(@Body() dto: UpsertOrganizationDto) {
    return this.organizationService.upsert(dto);
  }
}
