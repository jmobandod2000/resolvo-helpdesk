import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { UpdatesService } from './updates.service';

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(private readonly updatesService: UpdatesService) {}

  // Versión instalada y si hay una nueva publicada (solo administradores)
  @Get('update')
  @Auth(ValidRoles.ADMIN)
  getUpdate() {
    return this.updatesService.getStatus();
  }
}
