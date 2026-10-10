import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class FilterMetricsDto {
  @ApiProperty({ description: 'Reportado desde', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  from?: Date;

  @ApiProperty({ description: 'Reportado hasta', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  to?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  siteId?: number;

  @ApiProperty({ description: 'Semanas de la tendencia', required: false })
  @IsOptional()
  @IsInt()
  @Min(4)
  @Max(52)
  @Type(() => Number)
  weeks?: number = 12;
}
