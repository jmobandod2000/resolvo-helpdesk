import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';

import useAlerts from 'src/modules/shared/composables/useAlerts';
import useNotify from 'src/modules/shared/composables/useNotify';
import useVueQuery from 'src/modules/shared/composables/useVueQuery';
import { TicketRoutes } from 'src/modules/tickets/interfaces/ticket-routes';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationsApi';
import type { AppNotification } from '../interfaces/notification';

const NOTIFICATIONS_KEY = ['notifications'];
const POLL_INTERVAL_MS = 20_000;

const useNotifications = () => {
  const { t } = useI18n();
  const router = useRouter();
  const { invalidQuery } = useVueQuery();
  const { infoNotify } = useNotify();
  const { playChime, showDesktopNotification } = useAlerts();

  const { data } = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: getNotifications,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  const items = computed(() => data.value?.items ?? []);
  const unread = computed(() => data.value?.unread ?? 0);
  const lastSeenId = ref<number | null>(null);

  const describe = (notification: AppNotification) =>
    t(`notifications.types.${notification.type}`, {
      actor: notification.actorName ?? t('notifications.someone'),
      code: notification.Ticket.code,
    });

  const openTicket = (notification: AppNotification) =>
    void router.push({ name: TicketRoutes.DETAIL, params: { term: notification.Ticket.code } });

  watch(items, (list) => {
    const newestId = list[0]?.id ?? 0;
    if (lastSeenId.value === null) {
      lastSeenId.value = newestId;
      return;
    }
    const fresh = list.filter((item) => item.id > lastSeenId.value! && !item.readAt);
    lastSeenId.value = Math.max(lastSeenId.value, newestId);
    if (!fresh.length) return;

    void playChime();
    const latest = fresh[0]!;
    infoNotify(fresh.length > 1 ? t('notifications.newMany', { n: fresh.length }) : describe(latest));
    showDesktopNotification(t('app.name'), describe(latest), () => openTicket(latest));
  });

  const refresh = () => invalidQuery({ queryKey: NOTIFICATIONS_KEY });

  const markReadMutation = useMutation({ mutationFn: markNotificationRead, onSuccess: refresh });
  const markAllMutation = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: refresh });

  const open = (notification: AppNotification) => {
    if (!notification.readAt) markReadMutation.mutate(notification.id);
    openTicket(notification);
  };

  return { items, unread, describe, open, markAllMutation };
};

export default useNotifications;
