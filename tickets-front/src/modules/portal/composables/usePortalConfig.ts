import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';

import { getPortalConfig } from '../api/portalApi';

const usePortalConfig = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal', 'config'],
    queryFn: getPortalConfig,
    staleTime: 1000 * 60 * 5,
  });

  const isEnabled = computed(() => !!data.value?.enabled);
  const sites = computed(() => data.value?.sites ?? []);
  const categories = computed(() => data.value?.categories ?? []);

  return { config: data, isEnabled, sites, categories, isLoading, isError };
};

export default usePortalConfig;
