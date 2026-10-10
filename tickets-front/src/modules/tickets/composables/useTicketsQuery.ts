import { computed } from 'vue';
import { keepPreviousData, useQuery } from '@tanstack/vue-query';

import { getTickets } from '../api/ticketsApi';
import { useTicketsManageStore } from './useTicketsManageStore';

export const useTicketsQuery = () => {
  const { filters, page, rowsPerPage } = useTicketsManageStore();

  const offset = computed(() => (page.value - 1) * rowsPerPage.value);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['tickets', filters, page, rowsPerPage],
    queryFn: () => getTickets(filters.value, rowsPerPage.value, offset.value),
    placeholderData: keepPreviousData,
  });

  return {
    tickets: computed(() => data.value?.data ?? []),
    total: computed(() => data.value?.total ?? 0),
    isFetching,
    isError,
    refetch,
  };
};
