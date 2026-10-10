import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AddNoteDto {
  @ApiProperty({ description: 'Nota de seguimiento' })
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  note: string;

  @ApiProperty({
    description: 'Visible para el solicitante en el portal',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
