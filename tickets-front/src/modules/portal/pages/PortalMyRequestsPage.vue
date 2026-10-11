<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { isAxiosError } from 'axios';
import { useI18n } from 'vue-i18n';

import useDates from 'src/modules/shared/composables/useDates';
import type { TicketStatus } from 'src/modules/tickets/interfaces/ticket';
import EmailAccessCard from '../components/EmailAccessCard.vue';
import { getMyRequests } from '../api/portalApi';
import { PortalRoutes } from '../interfaces/portal';

const DONE: TicketStatus[] = ['RESOLVED', 'CLOSED'];

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { formatDate, fromNow } = useDates();

const token = computed(() => String(route.params.token ?? ''));

const { data, isLoading, error } = useQuery({
  queryKey: ['portal', 'my-requests', token],
  queryFn: () => getMyRequests(token.value),
  retry: (count, err) => !(isAxiosError(err) && err.response?.status === 404) && count < 2,
});

const expired = computed(() => isAxiosError(error.value) && error.value.response?.status === 404);

const badgeColor = (status: TicketStatus) =>
  status === 'CANCELLED' ? 'grey-7' : DONE.includes(status) ? 'positive' : status === 'WAITING_INFO' ? 'orange-9' : 'primary';

const open = (ticketToken: string) =>
  void router.push({ name: PortalRoutes.TRACK, params: { token: ticketToken } });
</script>

<template>
  <q-page class="portal-page">
    <div class="portal-container q-gutter-md">
      <q-btn
        flat
        dense
        no-caps
        color="primary"
        icon="sym_r_arrow_back"
        :label="t('portal.backHome')"
        :to="{ name: PortalRoutes.HOME }"
      />

      <div v-if="isLoading" class="row justify-center q-pa-xl">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <template v-else-if="expired || !data">
        <q-card flat bordered class="text-center q-pa-lg">
          <q-icon name="sym_r_link_off" size="48px" color="grey-6" />
          <div class="text-h6 q-mt-sm">{{ t('portal.myRequests.expiredTitle') }}</div>
          <div class="text-body2 text-grey-8">{{ t('portal.myRequests.expiredBody') }}</div>
        </q-card>
        <EmailAccessCard />
      </template>

      <template v-else>
        <div>
          <div class="portal-title">{{ t('portal.myRequests.title') }}</div>
          <div class="text-body2 text-grey-8">
            {{ t('portal.myRequests.subtitle', { email: data.email, date: formatDate(data.expiresAt) }) }}
          </div>
        </div>

        <q-card flat bordered class="list-card">
          <div v-if="!data.tickets.length" class="text-center text-grey-7 q-pa-lg">
            {{ t('portal.myRequests.empty') }}
          </div>
          <q-list v-else separator>
            <q-item v-for="ticket in data.tickets" :key="ticket.token" clickable @click="open(ticket.token)">
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ ticket.title }}</q-item-label>
                <q-item-label caption>
                  {{ ticket.code }} · {{ t('portal.myRequests.sent', { date: formatDate(ticket.reportedAt) }) }}
                  · {{ t('portal.myRequests.updated', { time: fromNow(ticket.updatedAt) }) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="badgeColor(ticket.status)">{{ t(`portal.status.${ticket.status}`) }}</q-badge>
              </q-item-section>
              <q-item-section side><q-icon name="sym_r_chevron_right" /></q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </template>
    </div>
  </q-page>
</template>

<style scoped>
.portal-page {
  padding: 16px 16px 8px;
}
.portal-container {
  max-width: 760px;
  margin: 0 auto;
}
.portal-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #0b2149;
}
.list-card {
  border-radius: 14px;
}
</style>
