import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';
import { TicketCategory, TicketPriority } from '@prisma/client';

import { ReportGroupBy } from '../interfaces';

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

export class FilterReportDto {
  @ApiProperty({
    description: 'Desde (YYYY-MM-DD, hora local)',
    example: '2026-01-01',
  })
  @Matches(DATE_FORMAT)
  from: string;

  @ApiProperty({
    description: 'Hasta (YYYY-MM-DD, hora local, inclusive)',
    example: '2026-12-31',
  })
  @Matches(DATE_FORMAT)
  to: string;

  @ApiProperty({ enum: ReportGroupBy, required: false })
  @IsOptional()
  @IsEnum(ReportGroupBy)
  groupBy?: ReportGroupBy = ReportGroupBy.MONTH;

  @ApiProperty({
    description: 'Zona horaria IANA',
    required: false,
    example: 'America/Caracas',
  })
  @IsOptional()
  @IsString()
  timeZone?: string = 'UTC';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  siteId?: number;

  @ApiProperty({ enum: TicketCategory, required: false })
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @ApiProperty({ enum: TicketPriority, required: false })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  assigneeId?: number;
}
