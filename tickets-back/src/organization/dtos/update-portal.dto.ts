import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePortalDto {
  @ApiProperty({ description: 'Portal de solicitudes activo' })
  @IsBoolean()
  portalEnabled: boolean;

  @ApiProperty({
    description: 'Mensaje de bienvenida del portal',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  portalMessage?: string | null;

  @ApiProperty({
    description: 'Avisos por correo al solicitante',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  portalEmailEnabled?: boolean;
}
