import type { Ref } from 'vue';
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';

import { getTicket } from '../api/ticketsApi';

export const useTicketQuery = (term: Ref<string | undefined>) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ticket', term],
    queryFn: () => getTicket(term.value as string),
    enabled: computed(() => !!term.value),
  });

  return { ticket: data, isLoading, isError };
};
