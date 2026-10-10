import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth, GetUser } from '../../auth/decorators';
import { UserLogged, ValidRoles } from '../../auth/interfaces';
import { TicketsService } from '../services';
import {
  AddNoteDto,
  ChangeStatusDto,
  CreateTicketDto,
  FilterTicketDto,
  UpdateTicketDto,
} from '../dtos';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Auth()
  create(
    @Body() createTicketDto: CreateTicketDto,
    @GetUser() user: UserLogged,
  ) {
    return this.ticketsService.create(createTicketDto, user);
  }

  @Get()
  @Auth()
  findAll(@Query() filter: FilterTicketDto) {
    return this.ticketsService.findAll(filter);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string) {
    return this.ticketsService.findOne(term);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketDto,
    @GetUser() user: UserLogged,
  ) {
    return this.ticketsService.update(id, updateTicketDto, user);
  }

  @Patch(':id/status')
  @Auth()
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStatusDto: ChangeStatusDto,
    @GetUser() user: UserLogged,
  ) {
    return this.ticketsService.changeStatus(id, changeStatusDto, user);
  }

  @Post(':id/notes')
  @Auth()
  addNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() addNoteDto: AddNoteDto,
    @GetUser() user: UserLogged,
  ) {
    return this.ticketsService.addNote(id, addNoteDto, user);
  }

  @Post(':id/public-link')
  @Auth()
  getPublicLink(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.getPublicLink(id);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.remove(id);
  }
}
