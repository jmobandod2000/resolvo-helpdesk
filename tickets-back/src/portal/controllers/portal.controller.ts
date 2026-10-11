import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { PortalService } from '../services';
import {
  CreatePortalTicketDto,
  PortalAccessDto,
  PortalReplyDto,
} from '../dtos';
import { resolveLanguage } from '../../i18n';

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
  createTicket(
    @Body() dto: CreatePortalTicketDto,
    @Headers('x-lang') lang?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.portalService.createTicket(
      dto,
      resolveLanguage(lang, acceptLanguage),
    );
  }

  @Post('access')
  @Throttle({
    default: { limit: 3, ttl: 10 * MINUTE },
    hourly: { limit: 10, ttl: HOUR },
  })
  requestAccess(
    @Body() dto: PortalAccessDto,
    @Headers('x-lang') lang?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.portalService.requestAccess(
      dto.email,
      resolveLanguage(lang, acceptLanguage),
    );
  }

  @Get('requests/:token')
  @Throttle({ default: { limit: 30, ttl: MINUTE } })
  listRequests(@Param('token') token: string) {
    return this.portalService.listByAccess(token);
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
