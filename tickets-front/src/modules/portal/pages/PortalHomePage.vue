<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import useDates from 'src/modules/shared/composables/useDates';
import usePortalConfig from '../composables/usePortalConfig';
import usePortalStorage from '../composables/usePortalStorage';
import { extractToken } from '../helpers/portalLinks';
import { PortalRoutes } from '../interfaces/portal';

const { t } = useI18n();
const router = useRouter();
const { formatDate } = useDates();
const { config, isEnabled, isLoading } = usePortalConfig();
const { savedTickets, forgetDevice } = usePortalStorage();

const isLookupOpen = ref(false);
const lookupValue = ref('');
const lookupError = ref('');

const greeting = computed(() => config.value?.message || t('portal.home.defaultMessage'));

const openNew = () => void router.push({ name: PortalRoutes.NEW });

const openTicket = (token: string) =>
  void router.push({ name: PortalRoutes.TRACK, params: { token } });

const lookup = () => {
  const token = extractToken(lookupValue.value);
  if (!token) {
    lookupError.value = t('portal.home.invalidLink');
    return;
  }
  lookupError.value = '';
  openTicket(token);
};
</script>

<template>
  <q-page class="portal-page">
    <div class="portal-container q-gutter-lg">
      <div v-if="isLoading" class="row justify-center q-pa-xl">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <q-card v-else-if="!isEnabled" flat bordered class="text-center q-pa-lg">
        <q-icon name="sym_r_construction" size="48px" color="grey-6" />
        <div class="text-h6 q-mt-sm">{{ t('portal.disabled.title') }}</div>
        <div class="text-body2 text-grey-8">{{ t('portal.disabled.body') }}</div>
        <div v-if="config?.contactEmail" class="q-mt-sm">
          <a :href="`mailto:${config.contactEmail}`">{{ config.contactEmail }}</a>
        </div>
      </q-card>

      <template v-else>
        <div class="text-center q-pt-md">
          <div class="portal-title">{{ t('portal.home.title') }}</div>
          <div class="text-body1 text-grey-8 q-mt-sm portal-greeting">{{ greeting }}</div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-card
              v-ripple
              flat
              bordered
              class="action-card action-card--primary cursor-pointer full-height"
              tabindex="0"
              @click="openNew"
              @keyup.enter="openNew"
            >
              <q-card-section class="column items-center text-center q-pa-lg">
                <q-icon name="sym_r_add_circle" size="52px" />
                <div class="text-h6 q-mt-sm">{{ t('portal.home.newTitle') }}</div>
                <div class="text-body2 action-card__hint">{{ t('portal.home.newHint') }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6">
            <q-card
              v-ripple
              flat
              bordered
              class="action-card cursor-pointer full-height"
              tabindex="0"
              @click="isLookupOpen = !isLookupOpen"
              @keyup.enter="isLookupOpen = !isLookupOpen"
            >
              <q-card-section class="column items-center text-center q-pa-lg">
                <q-icon name="sym_r_search" size="52px" color="primary" />
                <div class="text-h6 q-mt-sm">{{ t('portal.home.trackTitle') }}</div>
                <div class="text-body2 text-grey-8">{{ t('portal.home.trackHint') }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-slide-transition>
          <q-card v-show="isLookupOpen" flat bordered>
            <q-card-section>
              <q-form class="row q-col-gutter-sm items-start" @submit.prevent="lookup">
                <div class="col-12 col-sm">
                  <q-input
                    v-model="lookupValue"
                    :label="t('portal.home.linkLabel')"
                    :hint="t('portal.home.linkHint')"
                    :error="!!lookupError"
                    :error-message="lookupError"
                    outlined
                    clearable
                    maxlength="500"
                  >
                    <template #prepend><q-icon name="sym_r_link" /></template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-auto">
                  <q-btn
                    type="submit"
                    unelevated
                    no-caps
                    color="primary"
                    class="full-width lookup-btn"
                    :label="t('portal.home.lookup')"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-slide-transition>

        <q-card v-if="savedTickets.length" flat bordered>
          <q-card-section class="row items-center">
            <div class="section-title col">{{ t('portal.home.myTickets') }}</div>
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              color="grey-7"
              icon="sym_r_delete_sweep"
              :label="t('portal.home.forget')"
              @click="forgetDevice"
            >
              <q-tooltip>{{ t('portal.home.forgetHint') }}</q-tooltip>
            </q-btn>
          </q-card-section>
          <q-separator />
          <q-list separator>
            <q-item
              v-for="ticket in savedTickets"
              :key="ticket.token"
              clickable
              @click="openTicket(ticket.token)"
            >
              <q-item-section avatar>
                <q-icon name="sym_r_confirmation_number" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ ticket.title }}</q-item-label>
                <q-item-label caption>{{ ticket.code }} · {{ formatDate(ticket.createdAt) }}</q-item-label>
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
  padding: 24px 16px 8px;
}
.portal-container {
  max-width: 760px;
  margin: 0 auto;
}
.portal-title {
  font-size: 1.9rem;
  font-weight: 700;
  color: #0b2149;
  line-height: 1.2;
}
.portal-greeting {
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
  white-space: pre-line;
}
.action-card {
  border-radius: 14px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.action-card:hover,
.action-card:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(11, 33, 73, 0.12);
  outline: none;
}
.action-card--primary {
  background: linear-gradient(135deg, #1a4fd6 0%, #5b3df5 100%);
  color: #fff;
  border-color: transparent;
}
.action-card__hint {
  opacity: 0.9;
}
.lookup-btn {
  min-height: 56px;
}
</style>
