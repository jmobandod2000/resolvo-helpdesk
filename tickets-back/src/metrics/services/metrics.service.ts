import { Injectable } from '@nestjs/common';
import { Prisma, TicketStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import {
  CATEGORY_LABELS,
  COMPANY_LABELS,
  DONE_STATUSES,
  OPEN_STATUSES,
  PRIORITY_LABELS,
  ROOT_CAUSE_LABELS,
  STATUS_LABELS,
} from '../../tickets/interfaces';
import { FilterMetricsDto } from '../dtos';
import {
  CountByKey,
  MetricsSummary,
  MetricsTimes,
  MetricsTotals,
  TopProductItem,
  WeeklyTrendItem,
} from '../interfaces';

type GroupableField =
  'status' | 'category' | 'company' | 'priority' | 'rootCause';

const AGING_BUCKETS = [
  { key: '0-2', label: '0 a 2 días', min: 0, max: 2 },
  { key: '3-7', label: '3 a 7 días', min: 3, max: 7 },
  { key: '8-15', label: '8 a 15 días', min: 8, max: 15 },
  { key: '16+', label: 'Más de 15 días', min: 16, max: Infinity },
];

const toNumberOrNull = (value: unknown) =>
  value === null || value === undefined
    ? null
    : Math.round(Number(value) * 10) / 10;

@Injectable()
export class MetricsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSummary(filter: FilterMetricsDto): Promise<MetricsSummary> {
    const where = this.buildWhere(filter);
    const sqlWhere = this.buildSqlWhere(filter);

    const [
      totals,
      times,
      byStatus,
      byCategory,
      byCompany,
      byPriority,
      byRootCause,
      byAssignee,
      backlogAging,
      weeklyTrend,
      topProducts,
    ] = await Promise.all([
      this.getTotals(where),
      this.getTimes(sqlWhere),
      this.countBy('status', where, STATUS_LABELS),
      this.countBy('category', where, CATEGORY_LABELS),
      this.countBy('company', where, COMPANY_LABELS),
      this.countBy('priority', where, PRIORITY_LABELS),
      this.countBy('rootCause', where, ROOT_CAUSE_LABELS),
      this.countByAssignee(where),
      this.getBacklogAging(where),
      this.getWeeklyTrend(sqlWhere, filter.weeks),
      this.getTopProducts(sqlWhere),
    ]);

    return {
      totals,
      times,
      byStatus,
      byCategory,
      byCompany,
      byPriority,
      byRootCause,
      byAssignee,
      backlogAging,
      weeklyTrend,
      topProducts,
    };
  }

  private buildWhere({
    from,
    to,
    company,
  }: FilterMetricsDto): Prisma.TicketWhereInput {
    return {
      isDeleted: false,
      ...(company && { company }),
      ...((from || to) && {
        reportedAt: { ...(from && { gte: from }), ...(to && { lte: to }) },
      }),
    };
  }

  private buildSqlWhere({ from, to, company }: FilterMetricsDto): Prisma.Sql {
    const conditions: Prisma.Sql[] = [Prisma.sql`t."isDeleted" = false`];
    if (company)
      conditions.push(Prisma.sql`t."company" = ${company}::"Company"`);
    if (from) conditions.push(Prisma.sql`t."reportedAt" >= ${from}`);
    if (to) conditions.push(Prisma.sql`t."reportedAt" <= ${to}`);
    return Prisma.join(conditions, ' AND ');
  }

  private async getTotals(
    where: Prisma.TicketWhereInput,
  ): Promise<MetricsTotals> {
    const [total, open, resolved, cancelled, escalatedToDev] =
      await Promise.all([
        this.prismaService.ticket.count({ where }),
        this.prismaService.ticket.count({
          where: { ...where, status: { in: OPEN_STATUSES } },
        }),
        this.prismaService.ticket.count({
          where: { ...where, status: { in: DONE_STATUSES } },
        }),
        this.prismaService.ticket.count({
          where: { ...where, status: TicketStatus.CANCELLED },
        }),
        this.prismaService.ticket.count({
          where: {
            ...where,
            OR: [
              { status: TicketStatus.ESCALATED_DEV },
              { devRequestRef: { not: null } },
            ],
          },
        }),
      ]);

    const effective = total - cancelled;
    const resolutionRate =
      effective > 0 ? Math.round((resolved / effective) * 1000) / 10 : 0;

    return { total, open, resolved, cancelled, escalatedToDev, resolutionRate };
  }

  private async getTimes(sqlWhere: Prisma.Sql): Promise<MetricsTimes> {
    const [row] = await this.prismaService.$queryRaw<
      {
        avg_first: number | null;
        avg_resolution: number | null;
        median_resolution: number | null;
      }[]
    >`
      SELECT
        AVG(EXTRACT(EPOCH FROM (t."firstResponseAt" - t."reportedAt")) / 3600) AS avg_first,
        AVG(EXTRACT(EPOCH FROM (t."resolvedAt" - t."reportedAt")) / 3600) AS avg_resolution,
        PERCENTILE_CONT(0.5) WITHIN GROUP (
          ORDER BY EXTRACT(EPOCH FROM (t."resolvedAt" - t."reportedAt")) / 3600
        ) FILTER (WHERE t."resolvedAt" IS NOT NULL) AS median_resolution
      FROM "Ticket" t
      WHERE ${sqlWhere}
    `;

    return {
      avgFirstResponseHours: toNumberOrNull(row?.avg_first),
      avgResolutionHours: toNumberOrNull(row?.avg_resolution),
      medianResolutionHours: toNumberOrNull(row?.median_resolution),
    };
  }

  private async countBy(
    field: GroupableField,
    where: Prisma.TicketWhereInput,
    labels: Record<string, string>,
  ): Promise<CountByKey[]> {
    const rows = await this.prismaService.ticket.groupBy({
      by: [field],
      where,
      _count: { _all: true },
    });

    return rows
      .map((row) => {
        const key = (row[field] as string | null) ?? 'NONE';
        return {
          key,
          label: labels[key] ?? 'Sin definir',
          count: row._count._all,
        };
      })
      .sort((a, b) => b.count - a.count);
  }

  private async countByAssignee(
    where: Prisma.TicketWhereInput,
  ): Promise<CountByKey[]> {
    const rows = await this.prismaService.ticket.groupBy({
      by: ['assigneeId'],
      where,
      _count: { _all: true },
    });

    const users = await this.prismaService.user.findMany({
      where: { id: { in: rows.map((row) => row.assigneeId).filter(Boolean) } },
      select: { id: true, name: true },
    });

    return rows
      .map((row) => ({
        key: String(row.assigneeId ?? 'NONE'),
        label:
          users.find((user) => user.id === row.assigneeId)?.name ??
          'Sin asignar',
        count: row._count._all,
      }))
      .sort((a, b) => b.count - a.count);
  }

  private async getBacklogAging(
    where: Prisma.TicketWhereInput,
  ): Promise<CountByKey[]> {
    const openTickets = await this.prismaService.ticket.findMany({
      where: { ...where, status: { in: OPEN_STATUSES } },
      select: { reportedAt: true },
    });

    const now = Date.now();
    const ageInDays = openTickets.map(({ reportedAt }) =>
      Math.floor((now - reportedAt.getTime()) / 86_400_000),
    );

    return AGING_BUCKETS.map(({ key, label, min, max }) => ({
      key,
      label,
      count: ageInDays.filter((days) => days >= min && days <= max).length,
    }));
  }

  private async getWeeklyTrend(
    sqlWhere: Prisma.Sql,
    weeks = 12,
  ): Promise<WeeklyTrendItem[]> {
    const rows = await this.prismaService.$queryRaw<
      { week: Date; created: bigint; resolved: bigint }[]
    >`
      WITH weeks AS (
        SELECT generate_series(
          date_trunc('week', now()) - (${weeks - 1} * INTERVAL '1 week'),
          date_trunc('week', now()),
          INTERVAL '1 week'
        ) AS week
      ),
      filtered AS (SELECT * FROM "Ticket" t WHERE ${sqlWhere})
      SELECT
        w.week,
        (SELECT COUNT(*) FROM filtered f WHERE date_trunc('week', f."reportedAt") = w.week) AS created,
        (SELECT COUNT(*) FROM filtered f WHERE date_trunc('week', f."resolvedAt") = w.week) AS resolved
      FROM weeks w
      ORDER BY w.week
    `;

    return rows.map(({ week, created, resolved }) => ({
      week: week.toISOString().slice(0, 10),
      created: Number(created),
      resolved: Number(resolved),
    }));
  }

  private async getTopProducts(
    sqlWhere: Prisma.Sql,
  ): Promise<TopProductItem[]> {
    const rows = await this.prismaService.$queryRaw<
      { product_code: string; count: bigint }[]
    >`
      SELECT p.product_code, COUNT(*) AS count
      FROM "Ticket" t, unnest(t."productCodes") AS p(product_code)
      WHERE ${sqlWhere}
      GROUP BY p.product_code
      ORDER BY count DESC, p.product_code
      LIMIT 10
    `;

    return rows.map(({ product_code, count }) => ({
      productCode: product_code,
      count: Number(count),
    }));
  }
}
