import { keepPreviousData, useQuery } from '@tanstack/vue-query';

import { getMetricsSummary } from '../api/metricsApi';
import { useDashboardManageStore } from './useDashboardManageStore';

export const useMetricsQuery = () => {
  const { filters } = useDashboardManageStore();

  const { data, isFetching, isError } = useQuery({
    queryKey: ['metrics', filters],
    queryFn: () => getMetricsSummary(filters.value),
    placeholderData: keepPreviousData,
  });

  return { metrics: data, isFetching, isError };
};
