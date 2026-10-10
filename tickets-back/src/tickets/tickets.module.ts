import { Module } from '@nestjs/common';

import { TicketsController } from './controllers';
import { TicketsService } from './services';
import { OrganizationModule } from '../organization/organization.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [OrganizationModule, NotificationsModule],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
