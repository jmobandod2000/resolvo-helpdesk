<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { copyToClipboard } from 'quasar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { isAxiosError } from 'axios';
import { useI18n } from 'vue-i18n';

import useDates from 'src/modules/shared/composables/useDates';
import useNotify from 'src/modules/shared/composables/useNotify';
import useHandlerErrors from 'src/modules/shared/composables/useHandlerErrors';
import useAlerts from 'src/modules/shared/composables/useAlerts';
import useTitleBadge from 'src/modules/shared/composables/useTitleBadge';
import type { TicketStatus } from 'src/modules/tickets/interfaces/ticket';
import { getPortalTicket, replyPortalTicket } from '../api/portalApi';
import usePortalStorage from '../composables/usePortalStorage';
import { buildTrackingUrl } from '../helpers/portalLinks';
import { PortalRoutes } from '../interfaces/portal';
import type { PortalEvent } from '../interfaces/portal';

type Stage = 'received' | 'inProgress' | 'resolved';

const STAGES: Stage[] = ['received', 'inProgress', 'resolved'];
const REPLY_MAX = 2000;

const STAGE_BY_STATUS: Record<TicketStatus, Stage> = {
  OPEN: 'received',
  IN_ANALYSIS: 'inProgress',
  WAITING_INFO: 'inProgress',
  ESCALATED_DEV: 'inProgress',
  RESOLVED: 'resolved',
  CLOSED: 'resolved',
  CANCELLED: 'resolved',
};

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const { formatDateTime } = useDates();
const { successNotify, errorNotify, infoNotify } = useNotify();
const { playChime, showDesktopNotification, desktopPermission, requestDesktopPermission } =
  useAlerts();
const { handleApiResponseError } = useHandlerErrors();
const { saveTicket } = usePortalStorage();

const token = computed(() => String(route.params.token ?? ''));
const isNew = computed(() => route.query.new === '1');
const trackingUrl = computed(() => buildTrackingUrl(token.value));
const reply = ref('');

const { data: ticket, isLoading, error } = useQuery({
  queryKey: ['portal', 'ticket', token],
  queryFn: () => getPortalTicket(token.value),
  refetchInterval: 30_000,
  refetchIntervalInBackground: true,
  retry: (count, err) => !(isAxiosError(err) && err.response?.status === 404) && count < 2,
});

const notFound = computed(() => isAxiosError(error.value) && !!error.value.response);

const isMessage = (event: PortalEvent) => event.type === 'NOTE' && !!event.message;

const unseen = ref(0);
const lastSignature = ref<string | null>(null);
const skipNextAlert = ref(false);

useTitleBadge(unseen);

const signatureOf = (value: NonNullable<typeof ticket.value>) =>
  `${value.status}|${value.events.filter((event) => isMessage(event) && !event.fromRequester).length}`;

const clearUnseen = () => {
  if (document.visibilityState === 'visible') unseen.value = 0;
};

onMounted(() => document.addEventListener('visibilitychange', clearUnseen));
onBeforeUnmount(() => document.removeEventListener('visibilitychange', clearUnseen));

watch(ticket, (value) => {
  if (!value) return;
  saveTicket({
    code: value.code,
    title: value.title,
    token: token.value,
    createdAt: value.reportedAt,
  });

  const signature = signatureOf(value);
  const changed = lastSignature.value !== null && lastSignature.value !== signature;
  lastSignature.value = signature;
  if (!changed) return;
  if (skipNextAlert.value) {
    skipNextAlert.value = false;
    return;
  }

  void playChime();
  infoNotify(t('portal.track.newActivity'));
  showDesktopNotification(value.code, t('portal.track.newActivity'));
  if (document.visibilityState !== 'visible') unseen.value += 1;
});

const stage = computed<Stage>(() => (ticket.value ? STAGE_BY_STATUS[ticket.value.status] : 'received'));
const stageIndex = computed(() => STAGES.indexOf(stage.value));
const isCancelled = computed(() => ticket.value?.status === 'CANCELLED');
const isWaiting = computed(() => ticket.value?.status === 'WAITING_INFO');

const statusLabel = (status: TicketStatus | null) =>
  status ? t(`portal.status.${status}`) : '';


const replyRule = (value: string) =>
  value.trim().length >= 2 || t('portal.track.replyRule');

const mutation = useMutation({
  mutationFn: (message: string) => replyPortalTicket(token.value, message),
  onSuccess: (updated) => {
    skipNextAlert.value = true;
    queryClient.setQueryData(['portal', 'ticket', token], updated);
    reply.value = '';
    successNotify(t('portal.track.replySent'));
  },
  onError: handleApiResponseError,
});

const sendReply = () => {
  const message = reply.value.trim();
  if (message.length < 2 || mutation.isPending.value) return;
  mutation.mutate(message);
};

const copyLink = async () => {
  try {
    await copyToClipboard(trackingUrl.value);
    successNotify(t('portal.track.linkCopied'));
  } catch {
    errorNotify(t('common.copyFailed'));
  }
};

const dismissNew = () => void router.replace({ query: {} });
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

      <q-card v-else-if="notFound || !ticket" flat bordered class="text-center q-pa-lg">
        <q-icon name="sym_r_search_off" size="48px" color="grey-6" />
        <div class="text-h6 q-mt-sm">{{ t('portal.track.notFoundTitle') }}</div>
        <div class="text-body2 text-grey-8">{{ t('portal.track.notFoundBody') }}</div>
        <q-btn
          unelevated
          no-caps
          color="primary"
          class="q-mt-md"
          :label="t('portal.home.newTitle')"
          :to="{ name: PortalRoutes.NEW }"
        />
      </q-card>

      <template v-else>
        <q-card v-if="isNew" flat class="success-card">
          <q-card-section class="row items-start no-wrap q-gutter-md">
            <q-icon name="sym_r_task_alt" size="44px" color="positive" />
            <div class="col">
              <div class="text-h6">{{ t('portal.track.createdTitle', { code: ticket.code }) }}</div>
              <div class="text-body2 text-grey-9">{{ t('portal.track.createdBody') }}</div>
              <div class="row q-gutter-sm q-mt-sm">
                <q-btn
                  unelevated
                  no-caps
                  color="positive"
                  icon="sym_r_content_copy"
                  :label="t('portal.track.copyLink')"
                  @click="copyLink"
                />
                <q-btn flat no-caps color="grey-8" :label="t('portal.track.understood')" @click="dismissNew" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="ticket-card">
          <q-card-section>
            <div class="row items-center q-gutter-sm">
              <q-badge outline color="primary" class="text-body2">{{ ticket.code }}</q-badge>
              <q-badge
                :color="isCancelled ? 'grey-7' : stage === 'resolved' ? 'positive' : isWaiting ? 'orange-9' : 'primary'"
                class="text-body2"
              >
                {{ statusLabel(ticket.status) }}
              </q-badge>
              <q-space />
              <q-btn
                v-if="desktopPermission === 'default'"
                flat
                dense
                no-caps
                color="primary"
                icon="sym_r_notifications_active"
                :label="t('portal.track.enableAlerts')"
                @click="requestDesktopPermission"
              />
              <q-btn flat dense no-caps color="primary" icon="sym_r_link" :label="t('portal.track.copyLink')" @click="copyLink" />
            </div>
            <div class="ticket-title q-mt-sm">{{ ticket.title }}</div>
          </q-card-section>

          <q-card-section v-if="!isCancelled" class="q-pt-none">
            <div class="progress row no-wrap items-start">
              <template v-for="(item, index) in STAGES" :key="item">
                <div class="progress__step column items-center" :class="{ 'progress__step--done': index <= stageIndex }">
                  <div class="progress__dot">
                    <q-icon :name="index < stageIndex || stage === 'resolved' ? 'sym_r_check' : index === stageIndex ? 'sym_r_more_horiz' : ''" size="16px" />
                  </div>
                  <div class="progress__label">{{ t(`portal.stages.${item}`) }}</div>
                </div>
                <div v-if="index < STAGES.length - 1" class="progress__line" :class="{ 'progress__line--done': index < stageIndex }" />
              </template>
            </div>
          </q-card-section>

          <q-banner v-if="isWaiting" class="bg-orange-1 text-orange-10 q-mx-md q-mb-md" rounded>
            <template #avatar><q-icon name="sym_r_reply" /></template>
            {{ t('portal.track.waitingBanner') }}
          </q-banner>

          <q-banner v-if="ticket.resolution" class="bg-green-1 text-green-10 q-mx-md q-mb-md" rounded>
            <template #avatar><q-icon name="sym_r_verified" /></template>
            <div class="text-weight-medium">{{ t('portal.track.resolutionTitle') }}</div>
            <div class="text-pre-line">{{ ticket.resolution }}</div>
          </q-banner>

          <q-separator />
          <q-card-section class="row q-col-gutter-md text-body2">
            <div class="col-6 col-sm-3">
              <div class="text-caption text-grey-7">{{ t('portal.track.reportedAt') }}</div>
              {{ formatDateTime(ticket.reportedAt) }}
            </div>
            <div class="col-6 col-sm-3">
              <div class="text-caption text-grey-7">{{ t('portal.track.site') }}</div>
              {{ ticket.site ?? '—' }}
            </div>
            <div class="col-6 col-sm-3">
              <div class="text-caption text-grey-7">{{ t('portal.track.category') }}</div>
              {{ ticket.category ?? '—' }}
            </div>
            <div class="col-6 col-sm-3">
              <div class="text-caption text-grey-7">{{ t('portal.track.assignee') }}</div>
              {{ ticket.assignee ?? t('portal.track.pendingAssignee') }}
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-card-section class="section-title">{{ t('portal.track.conversation') }}</q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-md">
            <div class="bubble-row bubble-row--mine">
              <div class="bubble bubble--mine">
                <div class="bubble__author">{{ ticket.requesterName }}</div>
                <div class="text-pre-line">{{ ticket.description }}</div>
                <div class="bubble__date">{{ formatDateTime(ticket.reportedAt) }}</div>
              </div>
            </div>

            <template v-for="(event, index) in ticket.events" :key="index">
              <div
                v-if="isMessage(event)"
                class="bubble-row"
                :class="{ 'bubble-row--mine': event.fromRequester }"
              >
                <div class="bubble" :class="event.fromRequester ? 'bubble--mine' : 'bubble--team'">
                  <div class="bubble__author">
                    {{ event.fromRequester ? event.authorName : `${event.authorName} · ${t('portal.track.itTeam')}` }}
                  </div>
                  <div class="text-pre-line">{{ event.message }}</div>
                  <div class="bubble__date">{{ formatDateTime(event.createdAt) }}</div>
                </div>
              </div>
              <div v-else-if="event.type === 'STATUS_CHANGED'" class="system-line">
                <q-icon name="sym_r_swap_horiz" size="16px" />
                {{ t('portal.track.statusChanged', { status: statusLabel(event.toStatus) }) }}
                · {{ formatDateTime(event.createdAt) }}
              </div>
            </template>
          </q-card-section>

          <q-separator />
          <q-card-section v-if="ticket.canReply">
            <q-form class="q-gutter-sm" @submit.prevent="sendReply">
              <q-input
                v-model="reply"
                type="textarea"
                :label="t('portal.track.replyLabel')"
                :placeholder="t('portal.track.replyPlaceholder')"
                :maxlength="REPLY_MAX"
                :rules="[replyRule]"
                lazy-rules="ondemand"
                outlined
                autogrow
                counter
              />
              <div class="row justify-end">
                <q-btn
                  type="submit"
                  unelevated
                  no-caps
                  color="primary"
                  icon-right="sym_r_send"
                  :label="t('portal.track.sendReply')"
                  :loading="mutation.isPending.value"
                  :disable="reply.trim().length < 2"
                />
              </div>
            </q-form>
          </q-card-section>
          <q-card-section v-else class="text-center text-grey-8">
            <div>{{ t('portal.track.closed') }}</div>
            <q-btn
              unelevated
              no-caps
              color="primary"
              class="q-mt-sm"
              icon="sym_r_add_circle"
              :label="t('portal.home.newTitle')"
              :to="{ name: PortalRoutes.NEW }"
            />
          </q-card-section>
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
.success-card {
  background: #e9f7ef;
  border: 1px solid #a5d6b5;
  border-radius: 14px;
}
.ticket-card {
  border-radius: 14px;
}
.ticket-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0b2149;
  line-height: 1.3;
}
.progress {
  padding: 8px 4px 0;
}
.progress__step {
  width: 92px;
  flex-shrink: 0;
  text-align: center;
  color: #8a93a3;
}
.progress__step--done {
  color: #1a4fd6;
}
.progress__dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.progress__step--done .progress__dot {
  background: #1a4fd6;
  color: #fff;
  border-color: #1a4fd6;
}
.progress__label {
  font-size: 0.8rem;
  margin-top: 4px;
  font-weight: 500;
}
.progress__line {
  flex: 1;
  height: 2px;
  background: #d5dae3;
  margin-top: 13px;
}
.progress__line--done {
  background: #1a4fd6;
}
.bubble-row {
  display: flex;
}
.bubble-row--mine {
  justify-content: flex-end;
}
.bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.95rem;
  overflow-wrap: anywhere;
}
.bubble--mine {
  background: #eef3ff;
  border-bottom-right-radius: 4px;
}
.bubble--team {
  background: #f1f3f6;
  border-bottom-left-radius: 4px;
}
.bubble__author {
  font-size: 0.78rem;
  font-weight: 600;
  color: #0b2149;
  margin-bottom: 2px;
}
.bubble__date {
  font-size: 0.72rem;
  color: #6b7280;
  margin-top: 4px;
  text-align: right;
}
.system-line {
  text-align: center;
  font-size: 0.8rem;
  color: #6b7280;
}
</style>
