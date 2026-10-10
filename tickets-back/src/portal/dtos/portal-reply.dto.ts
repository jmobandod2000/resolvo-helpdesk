import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

import { cleanText } from '../helpers';

export class PortalReplyDto {
  @ApiProperty({ description: 'Respuesta del solicitante' })
  @Transform(({ value }) => cleanText(value))
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  message: string;
}
