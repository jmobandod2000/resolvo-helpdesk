export interface CountByKey {
  key: string;
  label: string;
  count: number;
}

export interface MetricsTotals {
  total: number;
  open: number;
  resolved: number;
  cancelled: number;
  escalatedToDev: number;
  resolutionRate: number;
}

export interface MetricsTimes {
  avgFirstResponseHours: number | null;
  avgResolutionHours: number | null;
  medianResolutionHours: number | null;
}

export interface WeeklyTrendItem {
  week: string;
  created: number;
  resolved: number;
}

export interface TopProductItem {
  productCode: string;
  count: number;
}

export interface MetricsSummary {
  totals: MetricsTotals;
  times: MetricsTimes;
  byStatus: CountByKey[];
  byCategory: CountByKey[];
  bySite: CountByKey[];
  byPriority: CountByKey[];
  byRootCause: CountByKey[];
  byAssignee: CountByKey[];
  backlogAging: CountByKey[];
  weeklyTrend: WeeklyTrendItem[];
  topProducts: TopProductItem[];
}

export interface MetricsFilters {
  siteId: number | null;
  from: string | null;
  to: string | null;
  weeks: number;
}
