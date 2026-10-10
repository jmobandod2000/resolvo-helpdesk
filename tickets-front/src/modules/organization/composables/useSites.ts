import { computed } from 'vue';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';

import useNotify from 'src/modules/shared/composables/useNotify';
import useHandlerErrors from 'src/modules/shared/composables/useHandlerErrors';
import useVueQuery from 'src/modules/shared/composables/useVueQuery';
import { createSite, deleteSite, getSites, updateSite } from '../api/organizationApi';
import type { SitePayload, SiteSummary } from '../interfaces/organization';

const SITES_KEY = ['sites'];

export const formatSite = (site: Pick<SiteSummary, 'code' | 'name'>) =>
  site.code ? `${site.code} ${site.name}` : site.name;

export const useSites = () => {
  const { t } = useI18n();

  const { data, isFetching } = useQuery({
    queryKey: SITES_KEY,
    queryFn: getSites,
    staleTime: 1000 * 60 * 5,
  });

  const sites = computed(() => data.value ?? []);

  const siteOptions = computed(() =>
    sites.value
      .filter((site) => site.isActive)
      .map((site) => ({ value: site.id, label: formatSite(site) })),
  );

  const allSiteOptions = computed(() =>
    sites.value.map((site) => ({ value: site.id, label: formatSite(site) })),
  );

  const siteLabel = (site?: SiteSummary | null) => (site ? formatSite(site) : t('sites.general'));

  const siteLabelById = (id?: number | string | null) => {
    const site = sites.value.find((item) => String(item.id) === String(id));
    return site ? formatSite(site) : t('sites.general');
  };

  return { sites, siteOptions, allSiteOptions, siteLabel, siteLabelById, isFetching };
};

export const useSiteMutations = () => {
  const { t } = useI18n();
  const { successNotify } = useNotify();
  const { handleApiResponseError } = useHandlerErrors();
  const { invalidQuery } = useVueQuery();

  const invalidateSites = () => invalidQuery({ queryKey: SITES_KEY });

  const createMutation = useMutation({
    mutationFn: (payload: SitePayload) => createSite(payload),
    onSuccess: (site) => {
      successNotify(t('sites.notify.created', { name: site.name }));
      invalidateSites();
    },
    onError: handleApiResponseError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<SitePayload> }) =>
      updateSite(id, payload),
    onSuccess: (site) => {
      successNotify(t('sites.notify.updated', { name: site.name }));
      invalidateSites();
    },
    onError: handleApiResponseError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSite(id),
    onSuccess: (site) => {
      successNotify(t('sites.notify.deleted', { name: site.name }));
      invalidateSites();
    },
    onError: handleApiResponseError,
  });

  return { createMutation, updateMutation, deleteMutation };
};
