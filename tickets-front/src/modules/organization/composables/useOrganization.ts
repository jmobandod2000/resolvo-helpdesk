import { computed } from 'vue';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';

import useNotify from 'src/modules/shared/composables/useNotify';
import useHandlerErrors from 'src/modules/shared/composables/useHandlerErrors';
import useVueQuery from 'src/modules/shared/composables/useVueQuery';
import {
  getOrganization,
  getPublicProfile,
  saveOrganization,
  savePortalSettings,
} from '../api/organizationApi';
import type { OrganizationPayload, PortalSettingsPayload } from '../interfaces/organization';

export const PUBLIC_PROFILE_KEY = ['organization', 'public'];
const ORGANIZATION_KEY = ['organization', 'detail'];

export const usePublicProfile = () => {
  const { data, isFetched } = useQuery({
    queryKey: PUBLIC_PROFILE_KEY,
    queryFn: getPublicProfile,
    staleTime: 1000 * 60 * 5,
  });

  const organizationName = computed(() => data.value?.name ?? null);
  const isConfigured = computed(() => data.value?.configured ?? true);
  const portalEnabled = computed(() => data.value?.portalEnabled ?? false);

  return { organizationName, isConfigured, portalEnabled, isFetched };
};

export const useOrganization = () => {
  const { t } = useI18n();
  const { successNotify } = useNotify();
  const { handleApiResponseError } = useHandlerErrors();
  const { invalidQuery } = useVueQuery();

  const { data, isFetching } = useQuery({
    queryKey: ORGANIZATION_KEY,
    queryFn: getOrganization,
    staleTime: 1000 * 60 * 5,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: OrganizationPayload) => saveOrganization(payload),
    onSuccess: () => {
      successNotify(t('organization.notify.saved'));
      invalidQuery({ queryKey: ['organization'] });
    },
    onError: handleApiResponseError,
  });

  const savePortalMutation = useMutation({
    mutationFn: (payload: PortalSettingsPayload) => savePortalSettings(payload),
    onSuccess: () => {
      successNotify(t('portalSettings.saved'));
      invalidQuery({ queryKey: ['organization'] });
      invalidQuery({ queryKey: ['portal'] });
    },
    onError: handleApiResponseError,
  });

  return { organization: data, isFetching, saveMutation, savePortalMutation };
};
