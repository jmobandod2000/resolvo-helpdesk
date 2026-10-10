import { Module } from '@nestjs/common';

import { OrganizationController, SitesController } from './controllers';
import { OrganizationService, SitesService } from './services';

@Module({
  controllers: [OrganizationController, SitesController],
  providers: [OrganizationService, SitesService],
  exports: [OrganizationService, SitesService],
})
export class OrganizationModule {}
