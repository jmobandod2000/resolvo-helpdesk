import { ref } from 'vue';
import dayjs from 'dayjs';
import { defineStore } from 'pinia';
import type { ReportFilters, ReportPreset } from '../interfaces/report';

const DATE_FORMAT = 'YYYY-MM-DD';

export const presetRange = (preset: ReportPreset) => {
  const today = dayjs();
  const ranges: Record<Exclude<ReportPreset, 'custom'>, [dayjs.Dayjs, dayjs.Dayjs]> = {
    thisMonth: [today.startOf('month'), today],
    lastMonth: [
      today.subtract(1, 'month').startOf('month'),
      today.subtract(1, 'month').endOf('month'),
    ],
    last3Months: [today.subtract(2, 'month').startOf('month'), today],
    last6Months: [today.subtract(5, 'month').startOf('month'), today],
    thisYear: [today.startOf('year'), today],
    lastYear: [
      today.subtract(1, 'year').startOf('year'),
      today.subtract(1, 'year').endOf('year'),
    ],
  };
  if (preset === 'custom') return null;
  const [from, to] = ranges[preset];
  return { from: from.format(DATE_FORMAT), to: to.format(DATE_FORMAT) };
};

const buildInitialFilters = (): ReportFilters => ({
  preset: 'last3Months',
  ...presetRange('last3Months')!,
  groupBy: 'month',
  siteId: null,
  categoryId: null,
  priority: null,
  assigneeId: null,
});

export const useReportsStore = defineStore('reports', () => {
  const filters = ref<ReportFilters>(buildInitialFilters());

  const setFilters = (partial: Partial<ReportFilters>) => {
    filters.value = { ...filters.value, ...partial };
  };

  const setPreset = (preset: ReportPreset) => {
    setFilters({ preset, ...(presetRange(preset) ?? {}) });
  };

  const setDates = (partial: Partial<Pick<ReportFilters, 'from' | 'to'>>) => {
    setFilters({ ...partial, preset: 'custom' });
  };

  const resetFilters = () => {
    filters.value = buildInitialFilters();
  };

  return { filters, setFilters, setPreset, setDates, resetFilters };
});
