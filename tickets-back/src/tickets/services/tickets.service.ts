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
import { i18nMessage } from '../../i18n';
import { CategoriesService, SitesService } from '../../organization/services';
import { NotificationsService } from '../../notifications/services';
import { RequesterMailService } from '../../mail/services';
import { generatePublicToken } from '../../common/utils/public-token';
import {
  CATEGORY_SUMMARY_SELECT,
  SITE_SUMMARY_SELECT,
} from '../../organization/helpers';

const USER_SUMMARY = { select: { id: true, name: true, email: true } };

const TICKET_LIST_INCLUDE = {
  Site: { select: SITE_SUMMARY_SELECT },
  Category: { select: CATEGORY_SUMMARY_SELECT },
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

export { generatePublicToken } from '../../common/utils/public-token';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sitesService: SitesService,
    private readonly categoriesService: CategoriesService,
    private readonly notificationsService: NotificationsService,
    private readonly requesterMailService: RequesterMailService,
  ) {}

  async create(createTicketDto: CreateTicketDto, user: UserLogged) {
    await this.sitesService.assertAssignable(createTicketDto.siteId);
    await this.categoriesService.assertAssignable(createTicketDto.categoryId);
    const created = await this.prismaService.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: { ...createTicketDto, createdById: user.id },
      });

      await tx.ticketEvent.create({
        data: {
          ticketId: ticket.id,
          userId: user.id,
          type: TicketEventType.CREATED,
          toStatus: ticket.status,
        },
      });

      return tx.ticket.update({
        where: { id: ticket.id },
        data: { code: buildTicketCode(ticket.id) },
        include: TICKET_LIST_INCLUDE,
      });
    });

    await this.notificationsService.ticketAssigned(
      created.id,
      created.assigneeId,
      user,
    );
    return created;
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

    if (!ticket)
      throw new NotFoundException(
        i18nMessage('errors.ticketNotFound', { term }),
      );
    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto, user: UserLogged) {
    const ticket = await this.findActiveOrFail(id);
    await this.sitesService.assertAssignable(
      updateTicketDto.siteId,
      ticket.siteId,
    );
    await this.categoriesService.assertAssignable(
      updateTicketDto.categoryId,
      ticket.categoryId,
    );
    const isReassigned =
      updateTicketDto.assigneeId !== undefined &&
      updateTicketDto.assigneeId !== ticket.assigneeId;

    const result = await this.prismaService.$transaction(async (tx) => {
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
          note: isReassigned ? (updated.Assignee?.name ?? null) : null,
        },
      });

      return updated;
    });

    if (isReassigned)
      await this.notificationsService.ticketAssigned(
        id,
        result.assigneeId,
        user,
      );
    return result;
  }

  async changeStatus(id: number, dto: ChangeStatusDto, user: UserLogged) {
    const ticket = await this.findActiveOrFail(id);
    const data = buildStatusChangeData(ticket, dto);

    const result = await this.prismaService.$transaction(async (tx) => {
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

    this.requesterMailService.statusChanged(id, dto.status);
    return result;
  }

  async addNote(id: number, { note, isPublic }: AddNoteDto, user: UserLogged) {
    const ticket = await this.findActiveOrFail(id);

    const event = await this.prismaService.$transaction(async (tx) => {
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
          isPublic: isPublic ?? false,
        },
        include: { User: USER_SUMMARY },
      });
    });

    if (event.isPublic) this.requesterMailService.publicReply(id, note);
    return event;
  }

  async getPublicLink(id: number) {
    const ticket = await this.findActiveOrFail(id);
    if (ticket.publicToken) return { token: ticket.publicToken };

    const { publicToken } = await this.prismaService.ticket.update({
      where: { id },
      data: { publicToken: generatePublicToken() },
      select: { publicToken: true },
    });
    return { token: publicToken };
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
    if (!ticket)
      throw new NotFoundException(
        i18nMessage('errors.ticketNotFound', { term: id }),
      );
    return ticket;
  }
}
