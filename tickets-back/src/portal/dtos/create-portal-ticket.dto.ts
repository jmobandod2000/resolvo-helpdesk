import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { cleanLine, cleanText, emptyToUndefined } from '../helpers';

export class CreatePortalTicketDto {
  @ApiProperty({
    description: 'Asunto corto',
    example: 'No imprime la impresora de caja',
  })
  @Transform(({ value }) => cleanLine(value))
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title: string;

  @ApiProperty({ description: 'Qué pasó, con el mayor detalle posible' })
  @Transform(({ value }) => cleanText(value))
  @IsString()
  @MinLength(10)
  @MaxLength(3000)
  description: string;

  @ApiProperty({ description: 'Nombre de quien reporta' })
  @Transform(({ value }) => cleanLine(value))
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  requesterName: string;

  @ApiProperty({ required: false })
  @Transform(({ value }) => emptyToUndefined(cleanLine(value)))
  @IsOptional()
  @IsString()
  @MaxLength(80)
  requesterArea?: string;

  @ApiProperty({ required: false })
  @Transform(({ value }) => emptyToUndefined(cleanLine(value)))
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  requesterEmail?: string;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  urgent?: boolean;

  @ApiProperty({
    description: 'Campo trampa: debe llegar vacío',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @ApiProperty({
    description: 'Milisegundos que tardó en llenarse el formulario',
  })
  @IsInt()
  @Min(0)
  @Max(86_400_000)
  @Type(() => Number)
  elapsedMs: number;
}
