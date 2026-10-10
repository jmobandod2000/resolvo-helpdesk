import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ValidRoles } from '../interfaces';

export class CreateUserDto {
  @ApiProperty({ description: 'Nombre completo del usuario' })
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name: string;

  @ApiProperty({ description: 'Correo electrónico del usuario' })
  @IsEmail({}, { message: 'El correo no es válido' })
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener una mayúscula, una minúscula y un número',
  })
  password: string;

  @ApiProperty({ enum: ValidRoles, required: false })
  @IsOptional()
  @IsEnum(ValidRoles)
  roles?: ValidRoles;
}
