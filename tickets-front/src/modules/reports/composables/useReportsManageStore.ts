import { storeToRefs } from 'pinia';
import { useReportsStore } from '../stores/useReportsStore';

export const useReportsManageStore = () => {
  const store = useReportsStore();
  const { filters } = storeToRefs(store);
  const { setFilters, setPreset, setDates, resetFilters } = store;

  return { filters, setFilters, setPreset, setDates, resetFilters };
};
