import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RootCause } from '@prisma/client';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @ApiProperty({ enum: RootCause, required: false })
  @IsOptional()
  @IsEnum(RootCause)
  rootCause?: RootCause;

  @ApiProperty({ description: 'Comentario de cierre', required: false })
  @IsOptional()
  @IsString()
  closureComment?: string;
}
