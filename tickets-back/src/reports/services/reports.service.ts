import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { DONE_STATUSES, OPEN_STATUSES } from '../../tickets/interfaces';
import { i18nMessage } from '../../i18n';
import { siteLabel } from '../../organization/helpers';
import { FilterReportDto } from '../dtos';
import {
  ReportAggregates,
  ReportAssigneeRow,
  ReportBacklogItem,
  ReportDimension,
  ReportDimensionRow,
  ReportGroupBy,
  ReportPeriod,
  ReportTicketItem,
  ReportTotals,
  TicketsReport,
} from '../interfaces';

const MAX_RANGE_DAYS = 1830;
const MAX_DETAIL_ROWS = 5000;
const DAY_MS = 86_400_000;

const STEP_BY_GROUP: Record<ReportGroupBy, string> = {
  [ReportGroupBy.WEEK]: '1 week',
  [ReportGroupBy.MONTH]: '1 month',
};

const DIMENSION_KEYS: Record<ReportDimension, string> = {
  assignee: `COALESCE(b."assigneeId"::text, 'NONE')`,
  site: `COALESCE(b."siteId"::text, 'NONE')`,
  category: `COALESCE(b."categoryId"::text, 'NONE')`,
  priority: `b."priority"::text`,
  rootCause: `COALESCE(b."rootCause"::text, 'NONE')`,
  requester: `b."requesterName"`,
};

const statusList = (statuses: string[]) =>
  Prisma.raw(statuses.map((status) => `'${status}'`).join(', '));

const OPEN_LIST = statusList(OPEN_STATUSES);
const DONE_LIST = statusList(DONE_STATUSES);

type AggregateRow = {
  received: bigint;
  resolved: bigint;
  closed: bigint;
  cancelled: bigint;
  escalated: bigint;
  avg_first: number | null;
  avg_resolution: number | null;
  median_resolution: number | null;
};

const round = (value: unknown) =>
  value === null || value === undefined
    ? null
    : Math.round(Number(value) * 10) / 10;

const toAggregates = (row: AggregateRow): ReportAggregates => ({
  received: Number(row.received),
  resolved: Number(row.resolved),
  closed: Number(row.closed),
  cancelled: Number(row.cancelled),
  escalated: Number(row.escalated),
  avgFirstResponseHours: round(row.avg_first),
  avgResolutionHours: round(row.avg_resolution),
  medianResolutionHours: round(row.median_resolution),
});

const toIso = (value: Date | null) => (value ? value.toISOString() : null);

const toDateString = (value: Date) => value.toISOString().slice(0, 10);

const aggregateColumns = (start: string, end: string) => {
  const inRange = (column: string) =>
    `${column} >= ${start} AND ${column} < ${end}`;
  const hours = (to: string, from: string) =>
    `EXTRACT(EPOCH FROM (${to} - ${from})) / 3600`;

  return Prisma.raw(`
    COUNT(b.id) FILTER (WHERE ${inRange('b.reported')}) AS received,
    COUNT(b.id) FILTER (WHERE ${inRange('b.resolved')}) AS resolved,
    COUNT(b.id) FILTER (WHERE ${inRange('b.closed')}) AS closed,
    COUNT(b.id) FILTER (WHERE ${inRange('b.reported')} AND b.status = 'CANCELLED') AS cancelled,
    COUNT(b.id) FILTER (
      WHERE ${inRange('b.reported')}
        AND (b.status = 'ESCALATED_DEV' OR b."devRequestRef" IS NOT NULL)
    ) AS escalated,
    AVG(${hours('b.first_response', 'b.reported')}) FILTER (
      WHERE ${inRange('b.reported')} AND b.first_response IS NOT NULL
    ) AS avg_first,
    AVG(${hours('b.resolved', 'b.reported')}) FILTER (WHERE ${inRange('b.resolved')}) AS avg_resolution,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${hours('b.resolved', 'b.reported')})
      FILTER (WHERE ${inRange('b.resolved')}) AS median_resolution
  `);
};

@Injectable()
export class ReportsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getReport(filter: FilterReportDto): Promise<TicketsReport> {
    const groupBy = filter.groupBy ?? ReportGroupBy.MONTH;
    const timeZone = filter.timeZone ?? 'UTC';
    this.validateRange(filter.from, filter.to);
    this.validateTimeZone(timeZone);

    const base = this.buildBase(filter, timeZone);

    const [
      totals,
      periods,
      byAssignee,
      bySite,
      byCategory,
      byPriority,
      byRootCause,
      byRequester,
      backlog,
      detail,
    ] = await Promise.all([
      this.getTotals(base),
      this.getPeriods(base, filter, groupBy, timeZone),
      this.getByAssignee(base, timeZone),
      this.getBySite(base),
      this.getByCategory(base),
      this.getByDimension('priority', base),
      this.getByDimension('rootCause', base),
      this.getByDimension('requester', base),
      this.getBacklog(base),
      this.getTickets(base),
    ]);

    return {
      range: {
        from: filter.from,
        to: filter.to,
        groupBy,
        timeZone,
        generatedAt: new Date().toISOString(),
      },
      totals,
      periods,
      byAssignee,
      bySite,
      byCategory,
      byPriority,
      byRootCause,
      byRequester,
      backlog,
      tickets: detail.slice(0, MAX_DETAIL_ROWS),
      ticketsTruncated: detail.length > MAX_DETAIL_ROWS,
    };
  }

  private validateRange(from: string, to: string) {
    const fromTime = Date.parse(`${from}T00:00:00Z`);
    const toTime = Date.parse(`${to}T00:00:00Z`);
    if (Number.isNaN(fromTime) || Number.isNaN(toTime) || fromTime > toTime)
      throw new BadRequestException(i18nMessage('errors.reportInvalidRange'));
    if ((toTime - fromTime) / DAY_MS > MAX_RANGE_DAYS)
      throw new BadRequestException(
        i18nMessage('errors.reportRangeTooLong', { days: MAX_RANGE_DAYS }),
      );
  }

  private validateTimeZone(timeZone: string) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone });
    } catch {
      throw new BadRequestException(
        i18nMessage('errors.reportInvalidTimeZone', { timeZone }),
      );
    }
  }

  private buildBase(
    { siteId, categoryId, priority, assigneeId, from, to }: FilterReportDto,
    timeZone: string,
  ): Prisma.Sql {
    const conditions: Prisma.Sql[] = [Prisma.sql`t."isDeleted" = false`];
    if (siteId) conditions.push(Prisma.sql`t."siteId" = ${siteId}`);
    if (categoryId) conditions.push(Prisma.sql`t."categoryId" = ${categoryId}`);
    if (priority)
      conditions.push(Prisma.sql`t."priority" = ${priority}::"TicketPriority"`);
    if (assigneeId) conditions.push(Prisma.sql`t."assigneeId" = ${assigneeId}`);

    const local = (column: string) =>
      Prisma.sql`(${Prisma.raw(`t."${column}"`)} AT TIME ZONE 'UTC' AT TIME ZONE ${timeZone})`;

    return Prisma.sql`
      bounds AS (
        SELECT ${from}::date::timestamp AS rs, (${to}::date + 1)::timestamp AS re
      ),
      base AS (
        SELECT
          t.*,
          ${local('reportedAt')} AS reported,
          ${local('firstResponseAt')} AS first_response,
          ${local('resolvedAt')} AS resolved,
          ${local('closedAt')} AS closed
        FROM "Ticket" t
        WHERE ${Prisma.join(conditions, ' AND ')}
      )
    `;
  }

  private async getTotals(base: Prisma.Sql): Promise<ReportTotals> {
    const [row] = await this.prismaService.$queryRaw<
      (AggregateRow & { open_now: bigint; done_of_received: bigint })[]
    >`
      WITH ${base}
      SELECT
        ${aggregateColumns('bd.rs', 'bd.re')},
        COUNT(b.id) FILTER (WHERE b.status IN (${OPEN_LIST})) AS open_now,
        COUNT(b.id) FILTER (
          WHERE b.reported >= bd.rs AND b.reported < bd.re AND b.status IN (${DONE_LIST})
        ) AS done_of_received
      FROM bounds bd
      LEFT JOIN base b ON true
      GROUP BY bd.rs, bd.re
    `;

    const aggregates = toAggregates(row);
    const effective = aggregates.received - aggregates.cancelled;
    const resolutionRate =
      effective > 0
        ? Math.round((Number(row.done_of_received) / effective) * 1000) / 10
        : 0;

    return { ...aggregates, openNow: Number(row.open_now), resolutionRate };
  }

  private async getPeriods(
    base: Prisma.Sql,
    { from, to }: FilterReportDto,
    groupBy: ReportGroupBy,
    timeZone: string,
  ): Promise<ReportPeriod[]> {
    const step = STEP_BY_GROUP[groupBy];
    const rows = await this.prismaService.$queryRaw<
      (AggregateRow & {
        period: Date;
        period_from: Date;
        period_to: Date;
        backlog_end: bigint;
      })[]
    >`
      WITH ${base},
      periods AS (
        SELECT
          gs AS period,
          GREATEST(gs, bd.rs) AS ws,
          LEAST(gs + ${step}::interval, bd.re) AS we
        FROM bounds bd,
          generate_series(
            date_trunc(${groupBy}, ${from}::date::timestamp),
            date_trunc(${groupBy}, ${to}::date::timestamp),
            ${step}::interval
          ) gs
      )
      SELECT
        p.period,
        p.ws::date AS period_from,
        (p.we - INTERVAL '1 day')::date AS period_to,
        ${aggregateColumns('p.ws', 'p.we')},
        COUNT(b.id) FILTER (
          WHERE b.reported < p.we
            AND (b.resolved IS NULL OR b.resolved >= p.we)
            AND b.status <> 'CANCELLED'
        ) AS backlog_end
      FROM periods p
      LEFT JOIN base b ON true
      GROUP BY p.period, p.ws, p.we
      ORDER BY p.period
    `;

    const today = new Intl.DateTimeFormat('en-CA', { timeZone }).format(
      new Date(),
    );

    return rows
      .map((row) => ({
        period: toDateString(row.period),
        periodFrom: toDateString(row.period_from),
        periodTo: toDateString(row.period_to),
        ...toAggregates(row),
        backlogAtEnd: Number(row.backlog_end),
      }))
      .filter((row) => row.periodFrom <= today);
  }

  private async queryDimension(
    dimension: ReportDimension,
    base: Prisma.Sql,
  ): Promise<ReportDimensionRow[]> {
    const rows = await this.prismaService.$queryRaw<
      (AggregateRow & { key: string; open_now: bigint })[]
    >`
      WITH ${base}
      SELECT
        ${Prisma.raw(DIMENSION_KEYS[dimension])} AS key,
        ${aggregateColumns('bd.rs', 'bd.re')},
        COUNT(b.id) FILTER (WHERE b.status IN (${OPEN_LIST})) AS open_now
      FROM base b
      CROSS JOIN bounds bd
      GROUP BY 1
    `;

    return rows
      .map((row) => ({
        key: row.key,
        label: null,
        ...toAggregates(row),
        openNow: Number(row.open_now),
      }))
      .filter(
        (row) => row.received || row.resolved || row.closed || row.openNow,
      );
  }

  private async getByDimension(
    dimension: ReportDimension,
    base: Prisma.Sql,
  ): Promise<ReportDimensionRow[]> {
    const rows = await this.queryDimension(dimension, base);
    return rows.sort(
      (a, b) => b.received - a.received || b.resolved - a.resolved,
    );
  }

  private async getBySite(base: Prisma.Sql): Promise<ReportDimensionRow[]> {
    const [rows, sites] = await Promise.all([
      this.getByDimension('site', base),
      this.prismaService.site.findMany({
        select: { id: true, code: true, name: true },
      }),
    ]);

    return rows.map((row) => {
      const site = sites.find((item) => String(item.id) === row.key);
      return { ...row, label: site ? siteLabel(site) : null };
    });
  }

  private async getByCategory(base: Prisma.Sql): Promise<ReportDimensionRow[]> {
    const [rows, categories] = await Promise.all([
      this.getByDimension('category', base),
      this.prismaService.category.findMany({
        select: { id: true, name: true },
      }),
    ]);

    return rows.map((row) => ({
      ...row,
      label:
        categories.find((item) => String(item.id) === row.key)?.name ?? null,
    }));
  }

  private async getByAssignee(
    base: Prisma.Sql,
    timeZone: string,
  ): Promise<ReportAssigneeRow[]> {
    const [rows, activity, users] = await Promise.all([
      this.queryDimension('assignee', base),
      this.prismaService.$queryRaw<
        {
          user_id: number;
          actions: bigint;
          notes: bigint;
          status_changes: bigint;
        }[]
      >`
        WITH ${base}
        SELECT
          e."userId" AS user_id,
          COUNT(*) AS actions,
          COUNT(*) FILTER (WHERE e.type = 'NOTE') AS notes,
          COUNT(*) FILTER (WHERE e.type = 'STATUS_CHANGED') AS status_changes
        FROM "TicketEvent" e
        JOIN base b ON b.id = e."ticketId"
        JOIN "User" eu ON eu.id = e."userId" AND eu."isSystem" = false
        CROSS JOIN bounds bd
        WHERE (e."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${timeZone}) >= bd.rs
          AND (e."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${timeZone}) < bd.re
        GROUP BY e."userId"
      `,
      this.prismaService.user.findMany({ select: { id: true, name: true } }),
    ]);

    const nameOf = (key: string) =>
      users.find((user) => String(user.id) === key)?.name ?? null;

    const merged = new Map<string, ReportAssigneeRow>(
      rows.map((row) => [
        row.key,
        {
          ...row,
          label: nameOf(row.key),
          actions: 0,
          notes: 0,
          statusChanges: 0,
        },
      ]),
    );

    activity.forEach((item) => {
      const key = String(item.user_id);
      const current = merged.get(key) ?? {
        key,
        label: nameOf(key),
        received: 0,
        resolved: 0,
        closed: 0,
        cancelled: 0,
        escalated: 0,
        avgFirstResponseHours: null,
        avgResolutionHours: null,
        medianResolutionHours: null,
        openNow: 0,
        actions: 0,
        notes: 0,
        statusChanges: 0,
      };
      merged.set(key, {
        ...current,
        actions: Number(item.actions),
        notes: Number(item.notes),
        statusChanges: Number(item.status_changes),
      });
    });

    return [...merged.values()].sort(
      (a, b) =>
        b.resolved - a.resolved ||
        b.actions - a.actions ||
        b.received - a.received,
    );
  }

  private async getBacklog(base: Prisma.Sql): Promise<ReportBacklogItem[]> {
    const rows = await this.prismaService.$queryRaw<
      {
        id: number;
        code: string | null;
        title: string;
        requesterName: string;
        site: string | null;
        category: string | null;
        priority: string;
        status: string;
        assignee: string | null;
        reportedAt: Date;
        lastActivityAt: Date | null;
      }[]
    >`
      WITH ${base}
      SELECT
        b.id, b.code, b.title, b."requesterName",
        NULLIF(concat_ws(' ', st.code, st.name), '') AS site,
        ct.name AS category,
        b.priority::text AS priority,
        b.status::text AS status,
        u.name AS assignee,
        b."reportedAt",
        (SELECT MAX(e."createdAt") FROM "TicketEvent" e WHERE e."ticketId" = b.id) AS "lastActivityAt"
      FROM base b
      LEFT JOIN "User" u ON u.id = b."assigneeId"
      LEFT JOIN "Site" st ON st.id = b."siteId"
      LEFT JOIN "Category" ct ON ct.id = b."categoryId"
      WHERE b.status IN (${OPEN_LIST})
      ORDER BY b."reportedAt"
    `;

    const now = Date.now();
    const daysSince = (value: Date) =>
      Math.floor((now - value.getTime()) / DAY_MS);

    return rows.map((row) => ({
      ...row,
      reportedAt: row.reportedAt.toISOString(),
      lastActivityAt: toIso(row.lastActivityAt),
      ageDays: daysSince(row.reportedAt),
      idleDays: daysSince(row.lastActivityAt ?? row.reportedAt),
    }));
  }

  private async getTickets(base: Prisma.Sql): Promise<ReportTicketItem[]> {
    const rows = await this.prismaService.$queryRaw<
      {
        id: number;
        code: string | null;
        title: string;
        requesterName: string;
        requesterArea: string | null;
        site: string | null;
        channel: string;
        category: string | null;
        priority: string;
        status: string;
        rootCause: string | null;
        assignee: string | null;
        devRequestRef: string | null;
        productCodes: string[];
        affectedUnits: number | null;
        reportedAt: Date;
        firstResponseAt: Date | null;
        resolvedAt: Date | null;
        closedAt: Date | null;
      }[]
    >`
      WITH ${base}
      SELECT
        b.id, b.code, b.title, b."requesterName", b."requesterArea",
        NULLIF(concat_ws(' ', st.code, st.name), '') AS site,
        b.channel::text AS channel,
        ct.name AS category,
        b.priority::text AS priority,
        b.status::text AS status,
        b."rootCause"::text AS "rootCause",
        u.name AS assignee,
        b."devRequestRef", b."productCodes", b."affectedUnits",
        b."reportedAt", b."firstResponseAt", b."resolvedAt", b."closedAt"
      FROM base b
      CROSS JOIN bounds bd
      LEFT JOIN "User" u ON u.id = b."assigneeId"
      LEFT JOIN "Site" st ON st.id = b."siteId"
      LEFT JOIN "Category" ct ON ct.id = b."categoryId"
      WHERE (b.reported >= bd.rs AND b.reported < bd.re)
         OR (b.resolved >= bd.rs AND b.resolved < bd.re)
         OR (b.closed >= bd.rs AND b.closed < bd.re)
      ORDER BY b."reportedAt" DESC
      LIMIT ${MAX_DETAIL_ROWS + 1}
    `;

    const hoursBetween = (end: Date | null, start: Date) =>
      end ? round((end.getTime() - start.getTime()) / 3_600_000) : null;

    return rows.map((row) => ({
      ...row,
      reportedAt: row.reportedAt.toISOString(),
      firstResponseAt: toIso(row.firstResponseAt),
      resolvedAt: toIso(row.resolvedAt),
      closedAt: toIso(row.closedAt),
      firstResponseHours: hoursBetween(row.firstResponseAt, row.reportedAt),
      resolutionHours: hoursBetween(row.resolvedAt, row.reportedAt),
    }));
  }
}
