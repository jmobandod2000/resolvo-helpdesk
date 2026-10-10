import { ref } from 'vue';
import { exportFile } from 'quasar';
import { useI18n } from 'vue-i18n';
import type { Workbook, Worksheet } from 'exceljs';

import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import useDates from 'src/modules/shared/composables/useDates';
import useNotify from 'src/modules/shared/composables/useNotify';
import { useSites } from 'src/modules/organization/composables/useSites';
import { usePublicProfile } from 'src/modules/organization/composables/useOrganization';
import useReportColumns from './useReportColumns';
import type { ReportColumn, ReportColumnKind } from './useReportColumns';
import type { ReportBreakdown, ReportFilters, TicketsReport } from '../interfaces/report';

const NUMBER_FORMATS: Partial<Record<ReportColumnKind, string>> = {
  number: '#,##0',
  hours: '0.0',
  datetime: 'dd/mm/yyyy hh:mm',
  date: 'dd/mm/yyyy',
};

const HEADER_FILL = 'FFE3EAF4';
const MAX_WIDTH = 60;
const MIN_WIDTH = 10;

const BREAKDOWN_SHEETS: { dimension: ReportBreakdown; rows: keyof TicketsReport }[] = [
  { dimension: 'site', rows: 'bySite' },
  { dimension: 'category', rows: 'byCategory' },
  { dimension: 'priority', rows: 'byPriority' },
  { dimension: 'rootCause', rows: 'byRootCause' },
  { dimension: 'requester', rows: 'byRequester' },
];

const toLocalDate = (value: string) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
};

const toCell = (kind: ReportColumnKind, value: string | number | null) => {
  if (value === null || value === undefined || value === '') return null;
  if (kind === 'number' || kind === 'hours') return Number(value);
  if (kind === 'datetime') return toLocalDate(String(value));
  if (kind === 'date') return new Date(`${value}T00:00:00Z`);
  return String(value);
};

const styleHeader = (sheet: Worksheet, row: number) => {
  sheet.getRow(row).eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: 'middle', wrapText: true };
  });
};

const useReportExport = () => {
  const { t } = useI18n();
  const { formatDate, formatDateTime } = useDates();
  const { categoryLabel, priorityLabel } = useCatalogs();
  const { siteLabelById } = useSites();
  const { organizationName } = usePublicProfile();
  const { errorNotify } = useNotify();
  const columns = useReportColumns();
  const isExporting = ref(false);

  const headerOf = (column: ReportColumn<never>) =>
    column.kind === 'hours' ? `${column.label} (h)` : column.label;

  const addTableSheet = <Row>(
    workbook: Workbook,
    name: string,
    sheetColumns: ReportColumn<Row>[],
    rows: Row[],
  ) => {
    const sheet = workbook.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });

    sheet.columns = sheetColumns.map((column) => {
      const header = headerOf(column as ReportColumn<never>);
      const longest = rows.reduce(
        (max, row) => Math.max(max, columns.display(column.kind, column.value(row)).length),
        header.length,
      );
      return {
        header,
        key: column.name,
        width: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, longest + 2)),
        style: NUMBER_FORMATS[column.kind] ? { numFmt: NUMBER_FORMATS[column.kind]! } : {},
      };
    });

    rows.forEach((row) =>
      sheet.addRow(
        Object.fromEntries(
          sheetColumns.map((column) => [column.name, toCell(column.kind, column.value(row))]),
        ),
      ),
    );

    styleHeader(sheet, 1);
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheetColumns.length } };
  };

  const addSummarySheet = (
    workbook: Workbook,
    report: TicketsReport,
    filters: ReportFilters,
    assigneeName: string | null,
  ) => {
    const sheet = workbook.addWorksheet(t('reports.sheets.summary'));
    sheet.columns = [{ width: 38 }, { width: 42 }];
    const all = t('reports.excel.all');
    const { totals } = report;

    sheet.addRow([t('reports.title')]).font = { bold: true, size: 14 };
    if (organizationName.value) sheet.addRow([organizationName.value]).font = { size: 12 };
    sheet.addRow([]);

    const filterRows: [string, string][] = [
      [
        t('reports.excel.range'),
        t('reports.rangeLabel', {
          from: formatDate(report.range.from),
          to: formatDate(report.range.to),
        }),
      ],
      [t('reports.filters.groupBy'), t(`reports.filters.${report.range.groupBy}`)],
      [t('reports.filters.site'), filters.siteId ? siteLabelById(filters.siteId) : all],
      [t('reports.filters.category'), filters.category ? categoryLabel(filters.category) : all],
      [t('reports.filters.priority'), filters.priority ? priorityLabel(filters.priority) : all],
      [t('reports.filters.assignee'), assigneeName ?? all],
      [t('reports.excel.timeZone'), report.range.timeZone],
      [t('reports.excel.generatedAt'), formatDateTime(report.range.generatedAt)],
    ];
    filterRows.forEach((row) => (sheet.addRow(row).getCell(1).font = { bold: true }));

    sheet.addRow([]);
    const headerRow = sheet.addRow([t('reports.excel.metric'), t('reports.excel.value')]);
    styleHeader(sheet, headerRow.number);

    const kpiRows: [string, number | null, string][] = [
      [t('reports.kpi.received'), totals.received, '#,##0'],
      [t('reports.kpi.resolved'), totals.resolved, '#,##0'],
      [t('reports.kpi.closed'), totals.closed, '#,##0'],
      [t('reports.columns.cancelled'), totals.cancelled, '#,##0'],
      [t('reports.kpi.escalated'), totals.escalated, '#,##0'],
      [t('reports.kpi.openNow'), totals.openNow, '#,##0'],
      [`${t('reports.kpi.resolutionRate')} (%)`, totals.resolutionRate, '0.0'],
      [`${t('reports.kpi.firstResponse')} (h)`, totals.avgFirstResponseHours, '0.0'],
      [`${t('reports.kpi.resolution')} (h)`, totals.avgResolutionHours, '0.0'],
      [`${t('reports.columns.medianResolution')} (h)`, totals.medianResolutionHours, '0.0'],
    ];
    kpiRows.forEach(([label, value, numFmt]) => {
      const row = sheet.addRow([label, value]);
      row.getCell(2).numFmt = numFmt;
      row.getCell(2).alignment = { horizontal: 'right' };
    });
  };

  const exportExcel = async (
    report: TicketsReport,
    filters: ReportFilters,
    assigneeName: string | null,
  ) => {
    isExporting.value = true;
    try {
      const { Workbook } = (await import('exceljs')).default;
      const workbook = new Workbook();
      workbook.creator = t('app.name');
      workbook.created = new Date();

      addSummarySheet(workbook, report, filters, assigneeName);
      addTableSheet(
        workbook,
        t('reports.sheets.periods'),
        columns.periodColumns(report.range.groupBy),
        report.periods,
      );
      addTableSheet(
        workbook,
        t('reports.sheets.assignees'),
        columns.assigneeColumns(),
        report.byAssignee,
      );
      BREAKDOWN_SHEETS.forEach(({ dimension, rows }) =>
        addTableSheet(
          workbook,
          t(`reports.sheets.${dimension}`),
          columns.breakdownColumns(dimension),
          report[rows] as TicketsReport['bySite'],
        ),
      );
      addTableSheet(
        workbook,
        t('reports.sheets.backlog'),
        columns.backlogColumns(),
        report.backlog,
      );
      addTableSheet(workbook, t('reports.sheets.detail'), columns.detailColumns(), report.tickets);

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `${t('reports.fileName')}_${report.range.from}_${report.range.to}.xlsx`;
      const status = exportFile(fileName, buffer as ArrayBuffer, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      if (status !== true) errorNotify(t('reports.exportError'));
    } catch {
      errorNotify(t('reports.exportError'));
    } finally {
      isExporting.value = false;
    }
  };

  return { exportExcel, isExporting };
};

export default useReportExport;
