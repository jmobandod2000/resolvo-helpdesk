import { Module } from '@nestjs/common';

import { MetricsController } from './controllers';
import { MetricsService } from './services';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
