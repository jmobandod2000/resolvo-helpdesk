import { computed } from 'vue';
import { keepPreviousData, useQuery } from '@tanstack/vue-query';

import { getTicketsReport } from '../api/reportsApi';
import { useReportsManageStore } from './useReportsManageStore';

export const useReportQuery = () => {
  const { filters } = useReportsManageStore();

  const isRangeValid = computed(
    () => !!filters.value.from && !!filters.value.to && filters.value.from <= filters.value.to,
  );

  const { data, isFetching, isError } = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => getTicketsReport(filters.value),
    enabled: isRangeValid,
    placeholderData: keepPreviousData,
  });

  return { report: data, isFetching, isError, isRangeValid };
};
