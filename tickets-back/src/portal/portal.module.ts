import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { OrganizationModule } from '../organization/organization.module';
import { TicketsModule } from '../tickets/tickets.module';
import { PortalController } from './controllers';
import { PortalService } from './services';

@Module({
  imports: [
    OrganizationModule,
    TicketsModule,
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 60 },
      { name: 'hourly', ttl: 3_600_000, limit: 300 },
    ]),
  ],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
