import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { MetricsFilters } from '../interfaces/metrics';

const initialFilters: MetricsFilters = { siteId: null, from: null, to: null, weeks: 12 };

export const useDashboardStore = defineStore('dashboard', () => {
  const filters = ref<MetricsFilters>({ ...initialFilters });

  const setFilters = (partial: Partial<MetricsFilters>) => {
    filters.value = { ...filters.value, ...partial };
  };

  const resetFilters = () => {
    filters.value = { ...initialFilters };
  };

  return { filters, setFilters, resetFilters };
});
