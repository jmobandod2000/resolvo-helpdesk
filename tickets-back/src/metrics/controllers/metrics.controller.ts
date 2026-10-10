import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from '../../auth/decorators';
import { MetricsService } from '../services';
import { FilterMetricsDto } from '../dtos';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('summary')
  @Auth()
  getSummary(@Query() filter: FilterMetricsDto) {
    return this.metricsService.getSummary(filter);
  }
}
