import { Module } from '@nestjs/common';

import { TicketsController } from './controllers';
import { TicketsService } from './services';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [OrganizationModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
