<script setup lang="ts">
import { ref } from 'vue';
import { useMutation } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';

import useHandlerErrors from 'src/modules/shared/composables/useHandlerErrors';
import { requestPortalAccess } from '../api/portalApi';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const { t } = useI18n();
const { handleApiResponseError } = useHandlerErrors();
const email = ref('');
const sentTo = ref<string | null>(null);

const emailRule = (value: string) => EMAIL_PATTERN.test(value.trim()) || t('auth.invalidEmail');

const mutation = useMutation({
  mutationFn: requestPortalAccess,
  onSuccess: () => {
    sentTo.value = email.value.trim();
    email.value = '';
  },
  onError: handleApiResponseError,
});

const submit = () => {
  if (!EMAIL_PATTERN.test(email.value.trim()) || mutation.isPending.value) return;
  mutation.mutate(email.value.trim());
};
</script>

<template>
  <q-card flat bordered class="access-card">
    <q-card-section class="row items-center no-wrap q-gutter-sm q-pb-sm">
      <q-icon name="sym_r_mark_email_read" size="28px" color="primary" />
      <div>
        <div class="text-subtitle1 text-weight-medium">{{ t('portal.access.title') }}</div>
        <div class="text-caption text-grey-7">{{ t('portal.access.hint') }}</div>
      </div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-banner v-if="sentTo" rounded class="bg-green-1 text-green-10 q-mb-sm">
        <template #avatar><q-icon name="sym_r_outgoing_mail" /></template>
        {{ t('portal.access.sent', { email: sentTo }) }}
      </q-banner>
      <q-form class="row q-col-gutter-sm items-start" @submit.prevent="submit">
        <div class="col-12 col-sm">
          <q-input
            v-model="email"
            type="email"
            :label="t('portal.new.email')"
            :rules="[emailRule]"
            lazy-rules="ondemand"
            maxlength="120"
            autocomplete="email"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-sm-auto">
          <q-btn
            type="submit"
            unelevated
            no-caps
            color="primary"
            icon-right="sym_r_send"
            class="full-width"
            :label="t('portal.access.send')"
            :loading="mutation.isPending.value"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.access-card {
  border-radius: 14px;
}
</style>
