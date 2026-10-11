<script setup lang="ts">
import { ref } from 'vue';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import useNotify from 'src/modules/shared/composables/useNotify';
import { useAuthStore } from 'src/modules/auth/stores/useAuthStore';
import { getMailStatus, sendTestEmail } from '../api/organizationApi';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const { t } = useI18n();
const { successNotify, errorNotify } = useNotify();
const { user } = storeToRefs(useAuthStore());

const testEmail = ref(user.value.email);

const { data: status, isLoading } = useQuery({
  queryKey: ['organization', 'mail-status'],
  queryFn: getMailStatus,
});

const testMutation = useMutation({
  mutationFn: (email: string) => sendTestEmail(email),
  onSuccess: ({ sent }) =>
    sent
      ? successNotify(t('portalSettings.mail.testSent', { email: testEmail.value }))
      : errorNotify(t('portalSettings.mail.testFailed')),
  onError: () => errorNotify(t('portalSettings.mail.testFailed')),
});

const isValidEmail = (value: string) => EMAIL_PATTERN.test(value.trim()) || t('portalSettings.mail.invalidEmail');

const sendTest = () => {
  if (isValidEmail(testEmail.value) !== true) return;
  testMutation.mutate(testEmail.value.trim());
};
</script>

<template>
  <q-card flat bordered>
    <q-card-section v-if="isLoading" class="row justify-center">
      <q-spinner-dots size="28px" color="primary" />
    </q-card-section>

    <template v-else-if="status">
      <q-card-section class="row items-center no-wrap q-gutter-md">
        <q-icon
          :name="status.configured ? 'sym_r_mark_email_read' : 'sym_r_unsubscribe'"
          :color="status.configured ? 'positive' : 'orange-9'"
          size="32px"
        />
        <div class="col">
          <div class="text-subtitle2">
            {{ status.configured ? t('portalSettings.mail.configured') : t('portalSettings.mail.notConfigured') }}
          </div>
          <div class="text-caption text-grey-7">
            <template v-if="status.configured">
              {{ t('portalSettings.mail.from', { from: status.from }) }}
              <template v-if="status.appUrl"> · {{ t('portalSettings.mail.appUrl', { url: status.appUrl }) }}</template>
            </template>
            <template v-else>{{ t('portalSettings.mail.notConfiguredHint') }}</template>
          </div>
        </div>
      </q-card-section>

      <template v-if="status.configured">
        <q-separator />
        <q-card-section>
          <q-form class="row q-col-gutter-sm items-start" @submit.prevent="sendTest">
            <div class="col-12 col-sm">
              <q-input
                v-model="testEmail"
                type="email"
                :label="t('portalSettings.mail.testLabel')"
                :rules="[isValidEmail]"
                maxlength="254"
                outlined
                dense
                lazy-rules
              >
                <template #prepend><q-icon name="sym_r_alternate_email" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-auto">
              <q-btn
                type="submit"
                unelevated
                no-caps
                color="primary"
                icon="sym_r_send"
                class="full-width"
                :label="t('portalSettings.mail.testSend')"
                :loading="testMutation.isPending.value"
              />
            </div>
          </q-form>
        </q-card-section>
      </template>
    </template>
  </q-card>
</template>
