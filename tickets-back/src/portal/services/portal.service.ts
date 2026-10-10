import { randomBytes } from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  Prisma,
  TicketChannel,
  TicketEventType,
  TicketPriority,
  TicketStatus,
  UserRole,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { i18nMessage } from '../../i18n';
import { encryptData } from '../../common/utils/encrypt-data';
import { siteLabel } from '../../organization/helpers';
import {
  CategoriesService,
  OrganizationService,
  SitesService,
} from '../../organization/services';
import {
  generatePublicToken,
  TicketsService,
} from '../../tickets/services/tickets.service';
import { NotificationsService } from '../../notifications/services';
import { CreatePortalTicketDto, PortalReplyDto } from '../dtos';

const SYSTEM_USER_EMAIL = 'portal@system.resolvo';
const MIN_FILL_TIME_MS = 4000;
const DUPLICATE_WINDOW_MS = 10 * 60_000;
const MAX_PORTAL_TICKETS_PER_HOUR = 200;
const MAX_REPLIES_PER_TICKET = 50;
const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;
const CLOSED_STATUSES: TicketStatus[] = [
  TicketStatus.CLOSED,
  TicketStatus.CANCELLED,
];

const PUBLIC_TICKET_INCLUDE = {
  Site: { select: { code: true, name: true } },
  Category: { select: { name: true } },
  Assignee: { select: { name: true } },
  Events: {
    orderBy: { createdAt: 'asc' },
    select: {
      type: true,
      toStatus: true,
      note: true,
      isPublic: true,
      authorName: true,
      createdAt: true,
      User: { select: { name: true, isSystem: true } },
    },
  },
} satisfies Prisma.TicketInclude;

type PublicTicketSource = Prisma.TicketGetPayload<{
  include: typeof PUBLIC_TICKET_INCLUDE;
}>;

@Injectable()
export class PortalService {
  private systemUserId: number | null = null;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly organizationService: OrganizationService,
    private readonly sitesService: SitesService,
    private readonly categoriesService: CategoriesService,
    private readonly ticketsService: TicketsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getConfig() {
    const organization = await this.organizationService.find();
    if (!organization?.portalEnabled)
      return { enabled: false, organizationName: organization?.name ?? null };

    const [sites, categories] = await Promise.all([
      this.prismaService.site.findMany({
        where: { isDeleted: false, isActive: true },
        orderBy: [{ code: 'asc' }, { name: 'asc' }],
        select: { id: true, code: true, name: true },
      }),
      this.prismaService.category.findMany({
        where: { isDeleted: false, isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, description: true },
      }),
    ]);

    return {
      enabled: true,
      organizationName: organization.name,
      message: organization.portalMessage,
      contactEmail: organization.email,
      sites: sites.map((site) => ({ id: site.id, label: siteLabel(site) })),
      categories,
    };
  }

  async createTicket(dto: CreatePortalTicketDto) {
    await this.assertEnabled();

    if (dto.website?.trim() || dto.elapsedMs < MIN_FILL_TIME_MS)
      throw new BadRequestException(i18nMessage('errors.portalRejected'));

    const duplicate = await this.prismaService.ticket.findFirst({
      where: {
        isDeleted: false,
        channel: TicketChannel.PORTAL,
        requesterName: { equals: dto.requesterName, mode: 'insensitive' },
        title: { equals: dto.title, mode: 'insensitive' },
        createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      },
      select: { code: true, publicToken: true },
    });
    if (duplicate?.publicToken)
      return {
        code: duplicate.code,
        token: duplicate.publicToken,
        duplicate: true,
      };

    const recent = await this.prismaService.ticket.count({
      where: {
        channel: TicketChannel.PORTAL,
        createdAt: { gte: new Date(Date.now() - 3_600_000) },
      },
    });
    if (recent >= MAX_PORTAL_TICKETS_PER_HOUR)
      throw new ServiceUnavailableException(i18nMessage('errors.portalBusy'));

    await this.sitesService.assertAssignable(dto.siteId);
    await this.categoriesService.assertAssignable(dto.categoryId);

    const systemUser = await this.getSystemUser();
    const ticket = await this.ticketsService.create(
      {
        title: dto.title,
        description: dto.description,
        requesterName: dto.requesterName,
        requesterArea: dto.requesterArea,
        requesterEmail: dto.requesterEmail?.toLowerCase() ?? null,
        siteId: dto.siteId ?? null,
        categoryId: dto.categoryId ?? null,
        channel: TicketChannel.PORTAL,
        priority: dto.urgent ? TicketPriority.HIGH : TicketPriority.MEDIUM,
        productCodes: [],
        documents: [],
        evidencePaths: [],
      },
      systemUser,
    );

    const token = generatePublicToken();
    await this.prismaService.$transaction([
      this.prismaService.ticket.update({
        where: { id: ticket.id },
        data: { publicToken: token },
      }),
      this.prismaService.ticketEvent.updateMany({
        where: { ticketId: ticket.id, type: TicketEventType.CREATED },
        data: { authorName: dto.requesterName },
      }),
    ]);

    await this.notificationsService.newPortalTicket(ticket, dto.requesterName);
    return { code: ticket.code, token, duplicate: false };
  }

  async getTicket(token: string) {
    await this.assertEnabled();
    return this.toPublicView(await this.findByToken(token));
  }

  async reply(token: string, { message }: PortalReplyDto) {
    await this.assertEnabled();
    const ticket = await this.findByToken(token);

    if (CLOSED_STATUSES.includes(ticket.status))
      throw new BadRequestException(i18nMessage('errors.portalTicketClosed'));

    const replies = ticket.Events.filter(
      (event) => event.type === TicketEventType.NOTE && event.User.isSystem,
    ).length;
    if (replies >= MAX_REPLIES_PER_TICKET)
      throw new BadRequestException(i18nMessage('errors.portalReplyLimit'));

    const systemUser = await this.getSystemUser();
    const reopens = ticket.status === TicketStatus.WAITING_INFO;

    await this.prismaService.$transaction(async (tx) => {
      await tx.ticketEvent.create({
        data: {
          ticketId: ticket.id,
          userId: systemUser.id,
          type: TicketEventType.NOTE,
          note: message,
          isPublic: true,
          authorName: ticket.requesterName,
        },
      });

      if (!reopens) return;
      await tx.ticket.update({
        where: { id: ticket.id },
        data: { status: TicketStatus.IN_ANALYSIS },
      });
      await tx.ticketEvent.create({
        data: {
          ticketId: ticket.id,
          userId: systemUser.id,
          type: TicketEventType.STATUS_CHANGED,
          fromStatus: TicketStatus.WAITING_INFO,
          toStatus: TicketStatus.IN_ANALYSIS,
          authorName: ticket.requesterName,
        },
      });
    });

    await this.notificationsService.requesterReply(
      ticket,
      ticket.requesterName,
    );
    return this.getTicket(token);
  }

  private async assertEnabled() {
    const organization = await this.organizationService.find();
    if (!organization?.portalEnabled)
      throw new NotFoundException(i18nMessage('errors.portalDisabled'));
  }

  private async findByToken(token: string) {
    const ticket = TOKEN_FORMAT.test(token)
      ? await this.prismaService.ticket.findFirst({
          where: { publicToken: token, isDeleted: false },
          include: PUBLIC_TICKET_INCLUDE,
        })
      : null;
    if (!ticket)
      throw new NotFoundException(i18nMessage('errors.portalTicketNotFound'));
    return ticket;
  }

  private toPublicView(ticket: PublicTicketSource) {
    const isDone =
      ticket.status === TicketStatus.RESOLVED ||
      ticket.status === TicketStatus.CLOSED;

    const events = ticket.Events.filter(
      (event) =>
        event.type === TicketEventType.CREATED ||
        event.type === TicketEventType.STATUS_CHANGED ||
        (event.type === TicketEventType.NOTE && event.isPublic),
    ).map((event) => ({
      type: event.type,
      toStatus: event.toStatus,
      message: event.type === TicketEventType.NOTE ? event.note : null,
      fromRequester: event.User.isSystem,
      authorName: event.User.isSystem
        ? (event.authorName ?? ticket.requesterName)
        : event.User.name,
      createdAt: event.createdAt,
    }));

    return {
      code: ticket.code,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      requesterName: ticket.requesterName,
      site: ticket.Site ? siteLabel(ticket.Site) : null,
      category: ticket.Category?.name ?? null,
      assignee: ticket.Assignee?.name ?? null,
      reportedAt: ticket.reportedAt,
      resolvedAt: ticket.resolvedAt,
      closedAt: ticket.closedAt,
      resolution: isDone ? ticket.closureComment : null,
      canReply: !CLOSED_STATUSES.includes(ticket.status),
      events,
    };
  }

  private async getSystemUser() {
    if (this.systemUserId) {
      const cached = await this.prismaService.user.findUnique({
        where: { id: this.systemUserId },
        omit: { password: true },
      });
      if (cached) return cached;
    }

    const existing = await this.prismaService.user.findFirst({
      where: { isSystem: true },
      omit: { password: true },
    });
    const user =
      existing ??
      (await this.prismaService.user.create({
        data: {
          name: 'Portal',
          email: SYSTEM_USER_EMAIL,
          password: await encryptData(randomBytes(48).toString('base64url')),
          roles: UserRole.user,
          isActive: false,
          isSystem: true,
        },
        omit: { password: true },
      }));

    this.systemUserId = user.id;
    return user;
  }
}
