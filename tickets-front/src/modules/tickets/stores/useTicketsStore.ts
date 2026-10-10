import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { TicketFilters } from '../interfaces/ticket';

const initialFilters: TicketFilters = {
  search: '',
  status: [],
  siteId: null,
  categoryId: null,
  priority: null,
  rootCause: null,
  assigneeId: null,
  onlyOpen: false,
};

export const useTicketsStore = defineStore('tickets', () => {
  const filters = ref<TicketFilters>({ ...initialFilters, status: [] });
  const page = ref(1);
  const rowsPerPage = ref(15);

  const setFilters = (partial: Partial<TicketFilters>) => {
    filters.value = { ...filters.value, ...partial };
    page.value = 1;
  };

  const resetFilters = () => {
    filters.value = { ...initialFilters, status: [] };
    page.value = 1;
  };

  const setPagination = (newPage: number, newRowsPerPage: number) => {
    page.value = newPage;
    rowsPerPage.value = newRowsPerPage;
  };

  return { filters, page, rowsPerPage, setFilters, resetFilters, setPagination };
});
