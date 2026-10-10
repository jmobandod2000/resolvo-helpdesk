import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';

import { getCatalogs } from '../api/dropDownsApi';
import type { Catalogs, SelectOption } from '../interfaces/catalogs';

type CatalogKey = keyof Catalogs;

const EMPTY_CATALOGS: Catalogs = {
  statuses: [],
  priorities: [],
  channels: [],
  rootCauses: [],
};

const ENUM_KEYS: Record<CatalogKey, string> = {
  statuses: 'enums.status',
  priorities: 'enums.priority',
  channels: 'enums.channel',
  rootCauses: 'enums.rootCause',
};

const useCatalogs = () => {
  const { t, te } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ['catalogs'],
    queryFn: getCatalogs,
    staleTime: Infinity,
  });

  const translate = (catalog: CatalogKey, value: string, fallback?: string) => {
    const key = `${ENUM_KEYS[catalog]}.${value}`;
    return te(key) ? t(key) : (fallback ?? value);
  };

  const catalogs = computed<Catalogs>(() => {
    const source = data.value ?? EMPTY_CATALOGS;
    const translateOptions = (catalog: CatalogKey): SelectOption[] =>
      source[catalog].map((option) => ({
        value: option.value,
        label: translate(catalog, option.value, option.label),
      }));
    return {
      statuses: translateOptions('statuses'),
      priorities: translateOptions('priorities'),
      channels: translateOptions('channels'),
      rootCauses: translateOptions('rootCauses'),
    };
  });

  const labelOf = (catalog: CatalogKey) => (value?: string | null) =>
    value ? translate(catalog, value) : '—';

  return {
    catalogs,
    isLoading,
    statusLabel: labelOf('statuses'),
    priorityLabel: labelOf('priorities'),
    channelLabel: labelOf('channels'),
    rootCauseLabel: labelOf('rootCauses'),
  };
};

export default useCatalogs;
