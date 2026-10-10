import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Número de elementos a mostrar',
    required: false,
  })
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Max(200)
  @Type(() => Number)
  limit?: number = 20;

  @ApiProperty({ description: 'Número de elementos a saltar', required: false })
  @IsOptional()
  @Min(0)
  @IsInt()
  @Type(() => Number)
  offset?: number = 0;
}
