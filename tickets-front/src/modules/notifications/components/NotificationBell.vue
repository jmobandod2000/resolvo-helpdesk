<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import useAlerts from 'src/modules/shared/composables/useAlerts';
import useDates from 'src/modules/shared/composables/useDates';
import useTitleBadge from 'src/modules/shared/composables/useTitleBadge';
import useNotifications from '../composables/useNotifications';
import type { NotificationType } from '../interfaces/notification';

const TYPE_ICONS: Record<NotificationType, string> = {
  NEW_PORTAL_TICKET: 'sym_r_support_agent',
  REQUESTER_REPLY: 'sym_r_forum',
  TICKET_ASSIGNED: 'sym_r_assignment_ind',
};

const { t } = useI18n();
const { fromNow } = useDates();
const { items, unread, describe, open, markAllMutation } = useNotifications();
const { soundEnabled, setSoundEnabled, desktopPermission, requestDesktopPermission } = useAlerts();

useTitleBadge(unread);
</script>

<template>
  <q-btn flat round dense icon="sym_r_notifications" class="q-mr-xs">
    <q-badge v-if="unread" color="negative" floating rounded>{{ unread > 99 ? '99+' : unread }}</q-badge>
    <q-tooltip>{{ t('notifications.title') }}</q-tooltip>

    <q-menu anchor="bottom right" self="top right" :offset="[0, 8]" class="notifications-menu">
      <q-card flat style="width: 380px; max-width: 92vw">
        <q-card-section class="row items-center q-py-sm">
          <div class="text-subtitle1 text-weight-medium col">{{ t('notifications.title') }}</div>
          <q-btn
            flat
            dense
            round
            size="sm"
            :icon="soundEnabled ? 'sym_r_volume_up' : 'sym_r_volume_off'"
            @click="setSoundEnabled(!soundEnabled)"
          >
            <q-tooltip>{{ soundEnabled ? t('notifications.soundOn') : t('notifications.soundOff') }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="desktopPermission === 'default'"
            flat
            dense
            round
            size="sm"
            icon="sym_r_desktop_windows"
            @click="requestDesktopPermission"
          >
            <q-tooltip>{{ t('notifications.enableDesktop') }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="unread"
            flat
            dense
            no-caps
            size="sm"
            color="primary"
            :label="t('notifications.markAll')"
            :loading="markAllMutation.isPending.value"
            @click="markAllMutation.mutate()"
          />
        </q-card-section>
        <q-separator />

        <div v-if="!items.length" class="column items-center q-pa-lg text-grey-7">
          <q-icon name="sym_r_notifications_off" size="36px" />
          <div class="q-mt-sm">{{ t('notifications.empty') }}</div>
        </div>

        <q-list v-else separator class="notifications-list">
          <q-item
            v-for="notification in items"
            :key="notification.id"
            v-close-popup
            clickable
            :class="{ 'bg-blue-1': !notification.readAt }"
            @click="open(notification)"
          >
            <q-item-section avatar>
              <q-avatar size="36px" color="blue-1" text-color="primary" :icon="TYPE_ICONS[notification.type]" />
            </q-item-section>
            <q-item-section>
              <q-item-label :class="{ 'text-weight-medium': !notification.readAt }">
                {{ describe(notification) }}
              </q-item-label>
              <q-item-label caption lines="1">{{ notification.Ticket.title }}</q-item-label>
              <q-item-label caption>{{ fromNow(notification.createdAt) }}</q-item-label>
            </q-item-section>
            <q-item-section v-if="!notification.readAt" side>
              <q-badge rounded color="primary" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-menu>
  </q-btn>
</template>

<style scoped>
.notifications-list {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
