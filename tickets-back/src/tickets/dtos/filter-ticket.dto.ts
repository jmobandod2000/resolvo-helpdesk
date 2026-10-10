import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { RootCause, TicketPriority, TicketStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dtos/pagination.dto';

const toArray = ({ value }: { value: unknown }) =>
  Array.isArray(value) ? value : String(value).split(',').filter(Boolean);

export class FilterTicketDto extends PaginationDto {
  @ApiProperty({ enum: TicketStatus, isArray: true, required: false })
  @IsOptional()
  @Transform(toArray)
  @IsEnum(TicketStatus, { each: true })
  status?: TicketStatus[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  siteId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({ enum: TicketPriority, required: false })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiProperty({ enum: RootCause, required: false })
  @IsOptional()
  @IsEnum(RootCause)
  rootCause?: RootCause;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  assigneeId?: number;

  @ApiProperty({
    description:
      'Busca en código, título, solicitante, descripción, productos y documentos',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Solo tickets abiertos', required: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  onlyOpen?: boolean;

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
}
