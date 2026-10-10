import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TicketChannel, TicketPriority } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty({ description: 'Título corto del ticket' })
  @IsString()
  @MinLength(5)
  @MaxLength(160)
  title: string;

  @ApiProperty({ description: 'Mensaje original del solicitante' })
  @IsString()
  @MinLength(5)
  description: string;

  @ApiProperty({ description: 'Persona que reporta' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  requesterName: string;

  @ApiProperty({ description: 'Área del solicitante', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  requesterArea?: string;

  @ApiProperty({
    description: 'Sede o sucursal; vacío si aplica a todas',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  siteId?: number | null;

  @ApiProperty({ enum: TicketChannel, required: false })
  @IsOptional()
  @IsEnum(TicketChannel)
  channel?: TicketChannel;

  @ApiProperty({ description: 'Categoría', required: false, nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoryId?: number | null;

  @ApiProperty({ enum: TicketPriority, required: false })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiProperty({ description: 'Códigos de producto', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productCodes?: string[];

  @ApiProperty({
    description: 'Pedidos, facturas, guías u otros documentos',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @ApiProperty({ description: 'Unidades involucradas', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  affectedUnits?: number;

  @ApiProperty({ description: 'Diagnóstico técnico', required: false })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({
    description: 'Referencia de la solicitud a desarrollo',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  devRequestRef?: string;

  @ApiProperty({
    description: 'Rutas de scripts, informes o evidencias',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidencePaths?: string[];

  @ApiProperty({ description: 'Usuario asignado', required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  assigneeId?: number;

  @ApiProperty({
    description: 'Fecha y hora en que se reportó',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  reportedAt?: Date;
}
