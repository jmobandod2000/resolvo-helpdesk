import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth, GetUser } from '../../auth/decorators';
import { UserLogged } from '../../auth/interfaces';
import { NotificationsService } from '../services';
import { FilterNotificationsDto } from '../dtos';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Auth()
  findMine(
    @Query() filter: FilterNotificationsDto,
    @GetUser() user: UserLogged,
  ) {
    return this.notificationsService.findMine(user.id, filter);
  }

  @Patch('read-all')
  @Auth()
  markAllRead(@GetUser() user: UserLogged) {
    return this.notificationsService.markAllRead(user.id);
  }

  @Patch(':id/read')
  @Auth()
  markRead(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserLogged) {
    return this.notificationsService.markRead(user.id, id);
  }
}
