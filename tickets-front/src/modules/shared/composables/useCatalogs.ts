import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';

import { getCatalogs } from '../api/dropDownsApi';
import type { Catalogs, SelectOption } from '../interfaces/catalogs';

const EMPTY_CATALOGS: Catalogs = {
  statuses: [],
  priorities: [],
  companies: [],
  channels: [],
  categories: [],
  rootCauses: [],
};

const findLabel = (options: SelectOption[], value?: string | null) =>
  options.find((option) => option.value === value)?.label ?? value ?? '—';

const useCatalogs = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['catalogs'],
    queryFn: getCatalogs,
    staleTime: Infinity,
  });

  const catalogs = computed(() => data.value ?? EMPTY_CATALOGS);

  return {
    catalogs,
    isLoading,
    statusLabel: (value?: string | null) => findLabel(catalogs.value.statuses, value),
    priorityLabel: (value?: string | null) => findLabel(catalogs.value.priorities, value),
    companyLabel: (value?: string | null) => findLabel(catalogs.value.companies, value),
    channelLabel: (value?: string | null) => findLabel(catalogs.value.channels, value),
    categoryLabel: (value?: string | null) => findLabel(catalogs.value.categories, value),
    rootCauseLabel: (value?: string | null) => findLabel(catalogs.value.rootCauses, value),
  };
};

export default useCatalogs;
