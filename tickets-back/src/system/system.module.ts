import { Module } from '@nestjs/common';

import { SystemController } from './system.controller';
import { UpdatesService } from './updates.service';

@Module({
  controllers: [SystemController],
  providers: [UpdatesService],
})
export class SystemModule {}
