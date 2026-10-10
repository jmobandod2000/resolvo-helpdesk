import { storeToRefs } from 'pinia';
import { useDashboardStore } from '../stores/useDashboardStore';

export const useDashboardManageStore = () => {
  const store = useDashboardStore();
  const { filters } = storeToRefs(store);
  const { setFilters, resetFilters } = store;

  return { filters, setFilters, resetFilters };
};
