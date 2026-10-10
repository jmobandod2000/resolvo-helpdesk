import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RootCause, TicketStatus } from '@prisma/client';

export class ChangeStatusDto {
  @ApiProperty({ enum: TicketStatus })
  @IsEnum(TicketStatus)
  status: TicketStatus;

  @ApiProperty({ description: 'Nota del cambio de estado', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  note?: string;

  @ApiProperty({ enum: RootCause, required: false })
  @IsOptional()
  @IsEnum(RootCause)
  rootCause?: RootCause;

  @ApiProperty({ description: 'Comentario de cierre', required: false })
  @IsOptional()
  @IsString()
  closureComment?: string;
}
