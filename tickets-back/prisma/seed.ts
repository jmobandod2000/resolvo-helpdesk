import {
  PrismaClient,
  TicketEventType,
  TicketStatus,
  UserRole,
} from '@prisma/client';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import {
  HISTORICAL_SITES as EXAMPLE_SITES,
  HISTORICAL_TICKETS as EXAMPLE_TICKETS,
  HistoricalSite,
  HistoricalTicket,
} from './data/historical-tickets';

dotenv.config();

// Tickets reales: prisma/data/historical-tickets.local.ts (ignorado por git). Si no existe, se usan los de ejemplo solo con SEED_EXAMPLE_TICKETS=true.
const LOCAL_TICKETS_FILE = path.join(
  __dirname,
  'data',
  'historical-tickets.local.ts',
);
interface HistoricalData {
  sites: HistoricalSite[];
  tickets: HistoricalTicket[];
}

const loadHistoricalData = (): HistoricalData => {
  if (!fs.existsSync(LOCAL_TICKETS_FILE))
    return process.env.SEED_EXAMPLE_TICKETS === 'true'
      ? { sites: EXAMPLE_SITES, tickets: EXAMPLE_TICKETS }
      : { sites: [], tickets: [] };
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const local = require('./data/historical-tickets.local') as {
    HISTORICAL_SITES: HistoricalSite[];
    HISTORICAL_TICKETS: HistoricalTicket[];
  };
  return { sites: local.HISTORICAL_SITES, tickets: local.HISTORICAL_TICKETS };
};

const { sites: HISTORICAL_SITES, tickets: HISTORICAL_TICKETS } =
  loadHistoricalData();

const prisma = new PrismaClient();

const buildTicketCode = (id: number) => `TK-${String(id).padStart(5, '0')}`;

const upsertAdmin = async () => {
  const email = process.env.LOGIN_EMAIL.toLowerCase();

  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: process.env.LOGIN_NAME,
      email,
      password: await argon2.hash(process.env.LOGIN_PASSWORD),
      roles: UserRole.admin,
    },
  });
};

interface SeedEvent {
  type: TicketEventType;
  fromStatus?: TicketStatus;
  toStatus: TicketStatus;
  note: string;
  createdAt: Date;
}

const buildEvents = (ticket: HistoricalTicket, userId: number) => {
  const events: SeedEvent[] = [
    {
      type: TicketEventType.CREATED,
      toStatus: TicketStatus.OPEN,
      note: 'Ticket registrado',
      createdAt: new Date(ticket.reportedAt),
    },
    {
      type: TicketEventType.STATUS_CHANGED,
      fromStatus: TicketStatus.OPEN,
      toStatus: TicketStatus.IN_ANALYSIS,
      note: 'Inicio del diagnóstico en base de datos',
      createdAt: new Date(ticket.firstResponseAt),
    },
  ];

  if (ticket.resolvedAt)
    events.push({
      type: TicketEventType.STATUS_CHANGED,
      fromStatus: TicketStatus.IN_ANALYSIS,
      toStatus: TicketStatus.RESOLVED,
      note: ticket.diagnosis,
      createdAt: new Date(ticket.resolvedAt),
    });

  if (ticket.closedAt)
    events.push({
      type: TicketEventType.STATUS_CHANGED,
      fromStatus: TicketStatus.RESOLVED,
      toStatus: TicketStatus.CLOSED,
      note: 'Respuesta enviada al solicitante',
      createdAt: new Date(ticket.closedAt),
    });

  if (!ticket.resolvedAt && ticket.status !== TicketStatus.IN_ANALYSIS)
    events.push({
      type: TicketEventType.STATUS_CHANGED,
      fromStatus: TicketStatus.IN_ANALYSIS,
      toStatus: ticket.status,
      note: ticket.diagnosis,
      createdAt: new Date(
        new Date(ticket.firstResponseAt).getTime() + 3_600_000,
      ),
    });

  return events.map((event) => ({ ...event, userId }));
};

const seedHistoricalSites = async () => {
  const siteIds = new Map<string, number>();
  for (const { code, name } of HISTORICAL_SITES) {
    const existing = await prisma.site.findFirst({
      where: { code, isDeleted: false },
    });
    const site =
      existing ?? (await prisma.site.create({ data: { code, name } }));
    siteIds.set(code, site.id);
  }
  return siteIds;
};

const seedHistoricalTickets = async (userId: number) => {
  const existing = await prisma.ticket.count();
  if (existing > 0) {
    console.log(
      `Se omiten los tickets históricos: ya existen ${existing} tickets`,
    );
    return;
  }

  const siteIds = await seedHistoricalSites();

  for (const historical of HISTORICAL_TICKETS) {
    const {
      reportedAt,
      firstResponseAt,
      resolvedAt,
      closedAt,
      siteCode,
      ...ticketData
    } = historical;

    const ticket = await prisma.ticket.create({
      data: {
        ...ticketData,
        reportedAt: new Date(reportedAt),
        firstResponseAt: new Date(firstResponseAt),
        resolvedAt: resolvedAt ? new Date(resolvedAt) : null,
        closedAt: closedAt ? new Date(closedAt) : null,
        siteId: siteCode ? (siteIds.get(siteCode) ?? null) : null,
        createdById: userId,
        assigneeId: userId,
        createdAt: new Date(reportedAt),
        Events: { create: buildEvents(historical, userId) },
      },
    });

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { code: buildTicketCode(ticket.id) },
    });
  }

  console.log(`Tickets históricos creados: ${HISTORICAL_TICKETS.length}`);
};

const main = async () => {
  const admin = await upsertAdmin();
  console.log(`Usuario administrador listo: ${admin.email}`);
  await seedHistoricalTickets(admin.id);
};

main()
  .catch((error) => {
    console.error('Error ejecutando el seed', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
