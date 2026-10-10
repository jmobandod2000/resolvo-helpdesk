import { Module } from '@nestjs/common';

import { TicketsController } from './controllers';
import { TicketsService } from './services';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
