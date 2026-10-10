import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { i18nMessage } from '../../i18n';
import { FilterNotificationsDto } from '../dtos';

interface TicketRef {
  id: number;
  assigneeId: number | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findMine(userId: number, { limit }: FilterNotificationsDto) {
    const [items, unread] = await Promise.all([
      this.prismaService.notification.findMany({
        where: { userId, Ticket: { isDeleted: false } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          type: true,
          actorName: true,
          readAt: true,
          createdAt: true,
          Ticket: { select: { id: true, code: true, title: true } },
        },
      }),
      this.prismaService.notification.count({
        where: { userId, readAt: null, Ticket: { isDeleted: false } },
      }),
    ]);
    return { items, unread };
  }

  async markRead(userId: number, id: number) {
    const { count } = await this.prismaService.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
    if (!count) {
      const exists = await this.prismaService.notification.count({
        where: { id, userId },
      });
      if (!exists)
        throw new NotFoundException(
          i18nMessage('errors.notificationNotFound', { id }),
        );
    }
    return { id };
  }

  async markAllRead(userId: number) {
    const { count } = await this.prismaService.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: count };
  }

  async newPortalTicket(ticket: TicketRef, actorName: string) {
    const recipients = await this.activeAgentIds();
    await this.create(
      recipients,
      ticket.id,
      NotificationType.NEW_PORTAL_TICKET,
      actorName,
    );
  }

  async requesterReply(ticket: TicketRef, actorName: string) {
    const recipients = ticket.assigneeId
      ? [ticket.assigneeId]
      : await this.activeAgentIds();
    await this.create(
      recipients,
      ticket.id,
      NotificationType.REQUESTER_REPLY,
      actorName,
    );
  }

  async ticketAssigned(
    ticketId: number,
    assigneeId: number | null | undefined,
    actor: { id: number; name: string },
  ) {
    if (!assigneeId || assigneeId === actor.id) return;
    await this.create(
      [assigneeId],
      ticketId,
      NotificationType.TICKET_ASSIGNED,
      actor.name,
    );
  }

  private async activeAgentIds() {
    const users = await this.prismaService.user.findMany({
      where: { isActive: true, isDeleted: false, isSystem: false },
      select: { id: true },
    });
    return users.map((user) => user.id);
  }

  private async create(
    userIds: number[],
    ticketId: number,
    type: NotificationType,
    actorName: string,
  ) {
    if (!userIds.length) return;
    try {
      await this.prismaService.notification.createMany({
        data: userIds.map((userId) => ({ userId, ticketId, type, actorName })),
      });
    } catch (error) {
      this.logger.error(`No se pudo crear la notificación ${type}`, error);
    }
  }
}
