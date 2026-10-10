import { storeToRefs } from 'pinia';
import { useTicketsStore } from '../stores/useTicketsStore';

export const useTicketsManageStore = () => {
  const store = useTicketsStore();
  const { filters, page, rowsPerPage } = storeToRefs(store);
  const { setFilters, resetFilters, setPagination } = store;

  return { filters, page, rowsPerPage, setFilters, resetFilters, setPagination };
};
