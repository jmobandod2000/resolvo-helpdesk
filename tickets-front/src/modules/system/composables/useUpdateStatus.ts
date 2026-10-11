import { computed, ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { LocalStorage } from 'quasar';

import useAuth from 'src/modules/auth/composables/useAuth';
import { getUpdateStatus } from '../api/systemApi';

const DISMISSED_KEY = 'resolvo.updateDismissed';
const HOUR_MS = 60 * 60 * 1000;

const readDismissed = () => {
  try {
    return LocalStorage.getItem(DISMISSED_KEY) as string | null;
  } catch {
    return null;
  }
};

// Compartido entre el aviso y "Acerca de": la versión ocultada vale para todo el navegador
const dismissedVersion = ref(readDismissed());

const useUpdateStatus = () => {
  const { isAdmin } = useAuth();

  const { data: status } = useQuery({
    queryKey: ['system', 'update'],
    queryFn: getUpdateStatus,
    enabled: isAdmin,
    staleTime: 6 * HOUR_MS,
    refetchInterval: 6 * HOUR_MS,
    retry: false,
  });

  const hasUpdate = computed(() => Boolean(status.value?.updateAvailable));
  const showBanner = computed(
    () => hasUpdate.value && dismissedVersion.value !== status.value?.latest,
  );

  const dismiss = () => {
    const latest = status.value?.latest;
    if (!latest) return;
    dismissedVersion.value = latest;
    try {
      LocalStorage.set(DISMISSED_KEY, latest);
    } catch {
      // sin almacenamiento local: se oculta solo en esta sesión
    }
  };

  return { status, hasUpdate, showBanner, dismiss };
};

export default useUpdateStatus;
