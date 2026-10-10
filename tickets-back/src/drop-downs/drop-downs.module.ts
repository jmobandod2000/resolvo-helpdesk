import { Module } from '@nestjs/common';

import { DropDownsController } from './drop-downs.controller';
import { DropDownsService } from './drop-downs.service';

@Module({
  controllers: [DropDownsController],
  providers: [DropDownsService],
})
export class DropDownsModule {}
