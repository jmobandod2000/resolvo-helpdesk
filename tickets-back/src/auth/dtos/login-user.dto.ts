import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ description: 'Correo electrónico del usuario' })
  @IsEmail({}, { message: 'El correo no es válido' })
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}
