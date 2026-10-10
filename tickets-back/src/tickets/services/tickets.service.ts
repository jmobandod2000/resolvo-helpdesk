import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TicketEventType } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { UserLogged } from '../../auth/interfaces';
import {
  AddNoteDto,
  ChangeStatusDto,
  CreateTicketDto,
  FilterTicketDto,
  UpdateTicketDto,
} from '../dtos';
import { buildStatusChangeData, buildTicketWhere } from '../helpers';

const USER_SUMMARY = { select: { id: true, name: true, email: true } };

const TICKET_LIST_INCLUDE = {
  Assignee: USER_SUMMARY,
  CreatedBy: USER_SUMMARY,
} satisfies Prisma.TicketInclude;

const TICKET_DETAIL_INCLUDE = {
  ...TICKET_LIST_INCLUDE,
  Events: {
    orderBy: { createdAt: 'desc' },
    include: { User: USER_SUMMARY },
  },
} satisfies Prisma.TicketInclude;

const buildTicketCode = (id: number) => `TK-${String(id).padStart(5, '0')}`;

@Injectable()
export class TicketsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createTicketDto: CreateTicketDto, user: UserLogged) {
    return this.prismaService.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: { ...createTicketDto, createdById: user.id },
      });

      await tx.ticketEvent.create({
        data: {
          ticketId: ticket.id,
          userId: user.id,
          type: TicketEventType.CREATED,
          toStatus: ticket.status,
          note: 'Ticket registrado',
        },
      });

      return tx.ticket.update({
        where: { id: ticket.id },
        data: { code: buildTicketCode(ticket.id) },
        include: TICKET_LIST_INCLUDE,
      });
    });
  }

  async findAll(
    filter: FilterTicketDto,
  ): Promise<
    PaginatedResponse<
      Prisma.TicketGetPayload<{ include: typeof TICKET_LIST_INCLUDE }>
    >
  > {
    const { limit, offset } = filter;
    const where = buildTicketWhere(filter);

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.ticket.findMany({
        where,
        include: TICKET_LIST_INCLUDE,
        orderBy: { reportedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prismaService.ticket.count({ where }),
    ]);

    return { data, total, limit, offset };
  }

  async findOne(term: string) {
    const where: Prisma.TicketWhereInput = /^\d+$/.test(term)
      ? { id: Number(term) }
      : { code: term.toUpperCase() };

    const ticket = await this.prismaService.ticket.findFirst({
      where: { ...where, isDeleted: false },
      include: TICKET_DETAIL_INCLUDE,
    });

    if (!ticket) throw new NotFoundException(`Ticket ${term} not found`);
    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto, user: UserLogged) {
    const ticket = await this.findActiveOrFail(id);
    const isReassigned =
      updateTicketDto.assigneeId !== undefined &&
      updateTicketDto.assigneeId !== ticket.assigneeId;

    return this.prismaService.$transaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id },
        data: updateTicketDto,
        include: TICKET_LIST_INCLUDE,
      });

      await tx.ticketEvent.create({
        data: {
          ticketId: id,
          userId: user.id,
          type: isReassigned
            ? TicketEventType.ASSIGNED
            : TicketEventType.UPDATED,
          note: isReassigned
            ? `Asignado a ${updated.Assignee?.name ?? 'nadie'}`
            : 'Datos del ticket actualizados',
        },
      });

      return updated;
    });
  }

  async changeStatus(id: number, dto: ChangeStatusDto, user: UserLogged) {
    const ticket = await this.findActiveOrFail(id);
    const data = buildStatusChangeData(ticket, dto);

    return this.prismaService.$transaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id },
        data,
        include: TICKET_LIST_INCLUDE,
      });

      await tx.ticketEvent.create({
        data: {
          ticketId: id,
          userId: user.id,
          type: TicketEventType.STATUS_CHANGED,
          fromStatus: ticket.status,
          toStatus: dto.status,
          note: dto.note,
        },
      });

      return updated;
    });
  }

  async addNote(id: number, { note }: AddNoteDto, user: UserLogged) {
    const ticket = await this.findActiveOrFail(id);

    return this.prismaService.$transaction(async (tx) => {
      if (!ticket.firstResponseAt)
        await tx.ticket.update({
          where: { id },
          data: { firstResponseAt: new Date() },
        });

      return tx.ticketEvent.create({
        data: {
          ticketId: id,
          userId: user.id,
          type: TicketEventType.NOTE,
          note,
        },
        include: { User: USER_SUMMARY },
      });
    });
  }

  async remove(id: number) {
    await this.findActiveOrFail(id);
    return this.prismaService.ticket.update({
      where: { id },
      data: { isDeleted: true },
      select: { id: true, code: true, isDeleted: true },
    });
  }

  private async findActiveOrFail(id: number) {
    const ticket = await this.prismaService.ticket.findFirst({
      where: { id, isDeleted: false },
    });
    if (!ticket) throw new NotFoundException(`Ticket with id ${id} not found`);
    return ticket;
  }
}
