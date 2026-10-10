import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpsertOrganizationDto {
  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Mi Empresa C.A.',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiProperty({
    description: 'Identificación fiscal (RIF, NIT, CNPJ...)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  taxId?: string | null;

  @ApiProperty({ description: 'Correo de contacto de TI', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  website?: string | null;
}
