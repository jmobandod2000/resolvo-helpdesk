import { api } from 'src/boot/axios';
import { i18n } from 'src/i18n';
import type { NotificationsFeed } from '../interfaces/notification';

const requestOptions = () => ({
  timeout: 1000 * 10,
  timeoutErrorMessage: i18n.global.t('errors.timeout.notifications'),
});

export const getNotifications = async () => {
  const resp = await api.get<NotificationsFeed>('notifications', {
    ...requestOptions(),
    params: { limit: 20 },
  });
  return resp.data;
};

export const markNotificationRead = async (id: number) => {
  const resp = await api.patch<{ id: number }>(`notifications/${id}/read`, {}, requestOptions());
  return resp.data;
};

export const markAllNotificationsRead = async () => {
  const resp = await api.patch<{ updated: number }>('notifications/read-all', {}, requestOptions());
  return resp.data;
};
