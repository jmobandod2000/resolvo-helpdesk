import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from '../services';
import { LoginUserDto } from '../dtos';
import { Auth, GetUser } from '../decorators';
import { UserLogged } from '../interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-auth-token')
  @Auth()
  checkAuthToken(@GetUser() user: UserLogged) {
    return this.authService.checkAuthToken(user);
  }
}
