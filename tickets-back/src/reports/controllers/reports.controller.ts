import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from '../../auth/decorators';
import { ReportsService } from '../services';
import { FilterReportDto } from '../dtos';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @Auth()
  getReport(@Query() filter: FilterReportDto) {
    return this.reportsService.getReport(filter);
  }
}
