import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AddNoteDto {
  @ApiProperty({ description: 'Nota de seguimiento' })
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  note: string;
}
