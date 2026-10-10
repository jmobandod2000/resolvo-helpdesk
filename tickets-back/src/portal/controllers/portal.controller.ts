import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { PortalService } from '../services';
import { CreatePortalTicketDto, PortalReplyDto } from '../dtos';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

@ApiTags('Portal')
@Controller('portal')
@UseGuards(ThrottlerGuard)
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('config')
  @Throttle({ default: { limit: 60, ttl: MINUTE } })
  getConfig() {
    return this.portalService.getConfig();
  }

  @Post('tickets')
  @Throttle({
    default: { limit: 5, ttl: 10 * MINUTE },
    hourly: { limit: 15, ttl: HOUR },
  })
  createTicket(@Body() dto: CreatePortalTicketDto) {
    return this.portalService.createTicket(dto);
  }

  @Get('tickets/:token')
  @Throttle({ default: { limit: 30, ttl: MINUTE } })
  getTicket(@Param('token') token: string) {
    return this.portalService.getTicket(token);
  }

  @Post('tickets/:token/replies')
  @Throttle({
    default: { limit: 6, ttl: 10 * MINUTE },
    hourly: { limit: 20, ttl: HOUR },
  })
  reply(@Param('token') token: string, @Body() dto: PortalReplyDto) {
    return this.portalService.reply(token, dto);
  }
}
