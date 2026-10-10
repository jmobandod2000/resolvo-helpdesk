export type ReportGroupBy = 'week' | 'month';

export type ReportPreset =
  | 'thisMonth'
  | 'lastMonth'
  | 'last3Months'
  | 'last6Months'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

export type ReportBreakdown = 'site' | 'category' | 'priority' | 'rootCause' | 'requester';

export interface ReportFilters {
  preset: ReportPreset;
  from: string;
  to: string;
  groupBy: ReportGroupBy;
  siteId: number | null;
  categoryId: number | null;
  priority: string | null;
  assigneeId: number | null;
}

export interface ReportAggregates {
  received: number;
  resolved: number;
  closed: number;
  cancelled: number;
  escalated: number;
  avgFirstResponseHours: number | null;
  avgResolutionHours: number | null;
  medianResolutionHours: number | null;
}

export interface ReportTotals extends ReportAggregates {
  openNow: number;
  resolutionRate: number;
}

export interface ReportPeriod extends ReportAggregates {
  period: string;
  periodFrom: string;
  periodTo: string;
  backlogAtEnd: number;
}

export interface ReportDimensionRow extends ReportAggregates {
  key: string;
  label: string | null;
  openNow: number;
}

export interface ReportAssigneeRow extends ReportDimensionRow {
  actions: number;
  notes: number;
  statusChanges: number;
}

export interface ReportBacklogItem {
  id: number;
  code: string | null;
  title: string;
  requesterName: string;
  site: string | null;
  category: string | null;
  priority: string;
  status: string;
  assignee: string | null;
  reportedAt: string;
  lastActivityAt: string | null;
  ageDays: number;
  idleDays: number;
}

export interface ReportTicketItem {
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
  reportedAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  firstResponseHours: number | null;
  resolutionHours: number | null;
}

export interface TicketsReport {
  range: { from: string; to: string; groupBy: ReportGroupBy; timeZone: string; generatedAt: string };
  totals: ReportTotals;
  periods: ReportPeriod[];
  byAssignee: ReportAssigneeRow[];
  bySite: ReportDimensionRow[];
  byCategory: ReportDimensionRow[];
  byPriority: ReportDimensionRow[];
  byRootCause: ReportDimensionRow[];
  byRequester: ReportDimensionRow[];
  backlog: ReportBacklogItem[];
  tickets: ReportTicketItem[];
  ticketsTruncated: boolean;
}
