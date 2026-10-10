import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Company } from '@prisma/client';

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

  @ApiProperty({ enum: Company, required: false })
  @IsOptional()
  @IsEnum(Company)
  company?: Company;

  @ApiProperty({ description: 'Semanas de la tendencia', required: false })
  @IsOptional()
  @IsInt()
  @Min(4)
  @Max(52)
  @Type(() => Number)
  weeks?: number = 12;
}
