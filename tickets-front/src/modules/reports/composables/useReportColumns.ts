import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import type { QTableColumn } from 'quasar';

import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import useDates from 'src/modules/shared/composables/useDates';
import type {
  ReportAggregates,
  ReportAssigneeRow,
  ReportBacklogItem,
  ReportBreakdown,
  ReportDimensionRow,
  ReportGroupBy,
  ReportPeriod,
  ReportTicketItem,
} from '../interfaces/report';

export type ReportColumnKind = 'text' | 'number' | 'hours' | 'datetime' | 'date';

export interface ReportColumn<Row> {
  name: string;
  label: string;
  kind: ReportColumnKind;
  value: (row: Row) => string | number | null;
}

const NUMERIC_KINDS: ReportColumnKind[] = ['number', 'hours'];

const useReportColumns = () => {
  const { t } = useI18n();
  const { formatDate, formatDateTime, formatHours, formatNumber } = useDates();
  const {
    categoryLabel,
    priorityLabel,
    statusLabel,
    channelLabel,
    rootCauseLabel,
  } = useCatalogs();

  const column = <Row>(
    name: string,
    kind: ReportColumnKind,
    value: (row: Row) => string | number | null,
  ): ReportColumn<Row> => ({ name, label: t(`reports.columns.${name}`), kind, value });

  const display = (kind: ReportColumnKind, value: string | number | null) => {
    if (value === null || value === undefined || value === '') return '—';
    if (kind === 'number') return formatNumber(Number(value));
    if (kind === 'hours') return formatHours(Number(value));
    if (kind === 'datetime') return formatDateTime(String(value));
    if (kind === 'date') return formatDate(String(value));
    return String(value);
  };

  const toTableColumns = <Row>(columns: ReportColumn<Row>[]): QTableColumn[] =>
    columns.map((item) => ({
      name: item.name,
      label: item.label,
      field: (row: Row) => item.value(row),
      align: NUMERIC_KINDS.includes(item.kind) ? 'right' : 'left',
      sortable: true,
      format: (value: string | number | null) => display(item.kind, value),
    }));

  const assigneeName = (name: string | null) => name ?? t('reports.unassigned');

  const periodLabel = (row: ReportPeriod, groupBy: ReportGroupBy) => {
    if (groupBy === 'month') {
      const label = dayjs(row.periodFrom).format('MMMM YYYY');
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    return t('reports.weekRange', {
      from: dayjs(row.periodFrom).format('DD/MM'),
      to: dayjs(row.periodTo).format('DD/MM/YYYY'),
    });
  };

  const aggregateColumns = <Row extends ReportAggregates>(): ReportColumn<Row>[] => [
    column<Row>('received', 'number', (row) => row.received),
    column<Row>('resolved', 'number', (row) => row.resolved),
    column<Row>('closed', 'number', (row) => row.closed),
    column<Row>('cancelled', 'number', (row) => row.cancelled),
    column<Row>('escalated', 'number', (row) => row.escalated),
  ];

  const timeColumns = <Row extends ReportAggregates>(): ReportColumn<Row>[] => [
    column<Row>('avgFirstResponse', 'hours', (row) => row.avgFirstResponseHours),
    column<Row>('avgResolution', 'hours', (row) => row.avgResolutionHours),
    column<Row>('medianResolution', 'hours', (row) => row.medianResolutionHours),
  ];

  const periodColumns = (groupBy: ReportGroupBy): ReportColumn<ReportPeriod>[] => [
    column<ReportPeriod>('period', 'text', (row) => periodLabel(row, groupBy)),
    column<ReportPeriod>('from', 'date', (row) => row.periodFrom),
    column<ReportPeriod>('to', 'date', (row) => row.periodTo),
    ...aggregateColumns<ReportPeriod>(),
    column<ReportPeriod>('backlogAtEnd', 'number', (row) => row.backlogAtEnd),
    ...timeColumns<ReportPeriod>(),
  ];

  const assigneeColumns = (): ReportColumn<ReportAssigneeRow>[] => [
    column<ReportAssigneeRow>('assignee', 'text', (row) =>
      row.key === 'NONE' ? t('reports.unassigned') : (row.label ?? `#${row.key}`),
    ),
    column<ReportAssigneeRow>('openNow', 'number', (row) => row.openNow),
    ...aggregateColumns<ReportAssigneeRow>(),
    column<ReportAssigneeRow>('actions', 'number', (row) => row.actions),
    column<ReportAssigneeRow>('notes', 'number', (row) => row.notes),
    column<ReportAssigneeRow>('statusChanges', 'number', (row) => row.statusChanges),
    ...timeColumns<ReportAssigneeRow>(),
  ];

  const breakdownLabel: Record<ReportBreakdown, (row: ReportDimensionRow) => string> = {
    site: (row) => (row.key === 'NONE' ? t('sites.general') : (row.label ?? row.key)),
    category: (row) => categoryLabel(row.key),
    priority: (row) => priorityLabel(row.key),
    rootCause: (row) =>
      row.key === 'NONE' ? t('reports.noRootCause') : rootCauseLabel(row.key),
    requester: (row) => row.key,
  };

  const siteName = (site: string | null) => site ?? t('sites.general');

  const breakdownColumns = (dimension: ReportBreakdown): ReportColumn<ReportDimensionRow>[] => [
    {
      name: 'key',
      label: t(`reports.breakdown.${dimension}`),
      kind: 'text',
      value: (row) => breakdownLabel[dimension](row),
    },
    column<ReportDimensionRow>('openNow', 'number', (row) => row.openNow),
    ...aggregateColumns<ReportDimensionRow>(),
    ...timeColumns<ReportDimensionRow>(),
  ];

  const backlogColumns = (): ReportColumn<ReportBacklogItem>[] => [
    column<ReportBacklogItem>('code', 'text', (row) => row.code),
    column<ReportBacklogItem>('title', 'text', (row) => row.title),
    column<ReportBacklogItem>('status', 'text', (row) => statusLabel(row.status)),
    column<ReportBacklogItem>('priority', 'text', (row) => priorityLabel(row.priority)),
    column<ReportBacklogItem>('assignee', 'text', (row) => assigneeName(row.assignee)),
    column<ReportBacklogItem>('requester', 'text', (row) => row.requesterName),
    column<ReportBacklogItem>('site', 'text', (row) => siteName(row.site)),
    column<ReportBacklogItem>('category', 'text', (row) => categoryLabel(row.category)),
    column<ReportBacklogItem>('reportedAt', 'datetime', (row) => row.reportedAt),
    column<ReportBacklogItem>('ageDays', 'number', (row) => row.ageDays),
    column<ReportBacklogItem>('lastActivityAt', 'datetime', (row) => row.lastActivityAt),
    column<ReportBacklogItem>('idleDays', 'number', (row) => row.idleDays),
  ];

  const detailColumns = (): ReportColumn<ReportTicketItem>[] => [
    column<ReportTicketItem>('code', 'text', (row) => row.code),
    column<ReportTicketItem>('title', 'text', (row) => row.title),
    column<ReportTicketItem>('status', 'text', (row) => statusLabel(row.status)),
    column<ReportTicketItem>('priority', 'text', (row) => priorityLabel(row.priority)),
    column<ReportTicketItem>('assignee', 'text', (row) => assigneeName(row.assignee)),
    column<ReportTicketItem>('requester', 'text', (row) => row.requesterName),
    column<ReportTicketItem>('area', 'text', (row) => row.requesterArea),
    column<ReportTicketItem>('site', 'text', (row) => siteName(row.site)),
    column<ReportTicketItem>('channel', 'text', (row) => channelLabel(row.channel)),
    column<ReportTicketItem>('category', 'text', (row) => categoryLabel(row.category)),
    column<ReportTicketItem>('rootCause', 'text', (row) =>
      row.rootCause ? rootCauseLabel(row.rootCause) : null,
    ),
    column<ReportTicketItem>('devRequest', 'text', (row) => row.devRequestRef),
    column<ReportTicketItem>('products', 'text', (row) => row.productCodes.join(', ') || null),
    column<ReportTicketItem>('units', 'number', (row) => row.affectedUnits),
    column<ReportTicketItem>('reportedAt', 'datetime', (row) => row.reportedAt),
    column<ReportTicketItem>('firstResponseAt', 'datetime', (row) => row.firstResponseAt),
    column<ReportTicketItem>('resolvedAt', 'datetime', (row) => row.resolvedAt),
    column<ReportTicketItem>('closedAt', 'datetime', (row) => row.closedAt),
    column<ReportTicketItem>('firstResponseHours', 'hours', (row) => row.firstResponseHours),
    column<ReportTicketItem>('resolutionHours', 'hours', (row) => row.resolutionHours),
  ];

  return {
    display,
    toTableColumns,
    periodColumns,
    assigneeColumns,
    breakdownColumns,
    backlogColumns,
    detailColumns,
  };
};

export default useReportColumns;
