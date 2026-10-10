import { Module } from '@nestjs/common';

import {
  CategoriesController,
  OrganizationController,
  SitesController,
} from './controllers';
import {
  CategoriesService,
  OrganizationService,
  SitesService,
} from './services';

@Module({
  controllers: [OrganizationController, SitesController, CategoriesController],
  providers: [OrganizationService, SitesService, CategoriesService],
  exports: [OrganizationService, SitesService, CategoriesService],
})
export class OrganizationModule {}
