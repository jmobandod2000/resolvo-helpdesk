import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSiteDto {
  @ApiProperty({
    description: 'Código corto opcional',
    required: false,
    example: '01',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string | null;

  @ApiProperty({
    description: 'Nombre de la sede o sucursal',
    example: 'Sede Central',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
