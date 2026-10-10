<script setup lang="ts">
import { computed, ref } from 'vue';
import { copyToClipboard } from 'quasar';
import { useMutation } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';

import useNotify from 'src/modules/shared/composables/useNotify';
import useHandlerErrors from 'src/modules/shared/composables/useHandlerErrors';
import { buildTrackingUrl } from 'src/modules/portal/helpers/portalLinks';
import { usePublicProfile } from 'src/modules/organization/composables/useOrganization';
import { getTicketPublicLink } from '../api/ticketsApi';

const props = defineProps<{ ticketId: number; code: string }>();

const { t } = useI18n();
const { successNotify, errorNotify } = useNotify();
const { handleApiResponseError } = useHandlerErrors();
const { portalEnabled } = usePublicProfile();

const isOpen = ref(false);
const token = ref<string | null>(null);
const url = computed(() => (token.value ? buildTrackingUrl(token.value) : ''));
const message = computed(() => t('tickets.publicLink.shareMessage', { code: props.code, url: url.value }));

const mutation = useMutation({
  mutationFn: () => getTicketPublicLink(props.ticketId),
  onSuccess: (data) => {
    token.value = data.token;
    isOpen.value = true;
  },
  onError: handleApiResponseError,
});

const copy = async (text: string) => {
  try {
    await copyToClipboard(text);
    successNotify(t('common.copied'));
  } catch {
    errorNotify(t('common.copyFailed'));
  }
};
</script>

<template>
  <q-btn
    outline
    color="primary"
    icon="sym_r_share"
    :label="t('tickets.publicLink.button')"
    :loading="mutation.isPending.value"
    @click="mutation.mutate()"
  />

  <q-dialog v-model="isOpen">
    <q-card style="width: 560px; max-width: 95vw">
      <q-card-section class="row items-center no-wrap q-gutter-sm">
        <q-icon name="sym_r_share" size="28px" color="primary" />
        <div class="text-h6">{{ t('tickets.publicLink.title', { code }) }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none q-gutter-md">
        <div class="text-body2 text-grey-8">{{ t('tickets.publicLink.description') }}</div>
        <q-banner v-if="!portalEnabled" dense rounded class="bg-orange-1 text-orange-10">
          <template #avatar><q-icon name="sym_r_warning" /></template>
          {{ t('tickets.publicLink.portalDisabled') }}
        </q-banner>
        <q-input :model-value="url" readonly outlined dense>
          <template #append>
            <q-btn flat round dense icon="sym_r_content_copy" @click="copy(url)">
              <q-tooltip>{{ t('common.copy') }}</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="sym_r_open_in_new" :href="url" target="_blank" rel="noopener">
              <q-tooltip>{{ t('tickets.publicLink.open') }}</q-tooltip>
            </q-btn>
          </template>
        </q-input>
        <q-input :model-value="message" readonly outlined dense type="textarea" autogrow :label="t('tickets.publicLink.messageLabel')" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat no-caps :label="t('common.close')" v-close-popup />
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="sym_r_content_copy"
          :label="t('tickets.publicLink.copyMessage')"
          @click="copy(message)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
