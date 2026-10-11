import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';

export class PortalAccessDto {
  @ApiProperty({
    description: 'Correo con el que se registraron las solicitudes',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail()
  @MaxLength(120)
  email: string;
}
