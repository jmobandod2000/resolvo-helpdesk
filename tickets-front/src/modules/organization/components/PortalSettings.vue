<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { copyToClipboard } from 'quasar';
import { useI18n } from 'vue-i18n';

import useNotify from 'src/modules/shared/composables/useNotify';
import { buildPortalUrl } from 'src/modules/portal/helpers/portalLinks';
import { useOrganization } from '../composables/useOrganization';

const MESSAGE_MAX = 500;

const { t } = useI18n();
const { successNotify, errorNotify } = useNotify();
const { organization, savePortalMutation } = useOrganization();

const enabled = ref(false);
const message = ref('');
const emailEnabled = ref(true);
const portalUrl = computed(() => buildPortalUrl());

watch(
  organization,
  (value) => {
    enabled.value = value?.portalEnabled ?? false;
    message.value = value?.portalMessage ?? '';
    emailEnabled.value = value?.portalEmailEnabled ?? true;
  },
  { immediate: true },
);

const save = () =>
  savePortalMutation.mutate({
    portalEnabled: enabled.value,
    portalMessage: message.value.trim() || null,
    portalEmailEnabled: emailEnabled.value,
  });

const copyLink = async () => {
  try {
    await copyToClipboard(portalUrl.value);
    successNotify(t('common.copied'));
  } catch {
    errorNotify(t('common.copyFailed'));
  }
};
</script>

<template>
  <div class="q-gutter-md">
    <div class="text-body2 text-grey-8">{{ t('portalSettings.description') }}</div>

    <q-banner v-if="!organization" rounded class="bg-orange-1 text-orange-10">
      {{ t('portalSettings.organizationFirst') }}
    </q-banner>

    <template v-else>
      <q-card flat bordered>
        <q-card-section class="row items-center no-wrap q-gutter-md">
          <q-toggle v-model="enabled" color="positive" size="lg" />
          <div>
            <div class="text-subtitle1 text-weight-medium">
              {{ enabled ? t('portalSettings.enabled') : t('portalSettings.disabled') }}
            </div>
            <div class="text-caption text-grey-7">{{ t('portalSettings.toggleHint') }}</div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered>
        <q-card-section class="row items-center no-wrap q-gutter-md">
          <q-toggle v-model="emailEnabled" color="primary" />
          <div>
            <div class="text-subtitle2">{{ t('portalSettings.email') }}</div>
            <div class="text-caption text-grey-7">{{ t('portalSettings.emailHint') }}</div>
          </div>
        </q-card-section>
      </q-card>

      <q-input
        v-model="message"
        type="textarea"
        :label="t('portalSettings.message')"
        :hint="t('portalSettings.messageHint')"
        :maxlength="MESSAGE_MAX"
        outlined
        autogrow
        counter
      />

      <q-card flat bordered>
        <q-card-section class="q-gutter-sm">
          <div class="text-subtitle2">{{ t('portalSettings.linkTitle') }}</div>
          <q-input :model-value="portalUrl" readonly outlined dense>
            <template #append>
              <q-btn flat round dense icon="sym_r_content_copy" @click="copyLink">
                <q-tooltip>{{ t('common.copy') }}</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="sym_r_open_in_new" :href="portalUrl" target="_blank" rel="noopener">
                <q-tooltip>{{ t('portalSettings.open') }}</q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <ul class="q-my-none q-pl-md text-body2 text-grey-8">
            <li>{{ t('portalSettings.tips.share') }}</li>
            <li>{{ t('portalSettings.tips.network') }}</li>
            <li>{{ t('portalSettings.tips.notes') }}</li>
            <li>{{ t('portalSettings.tips.protection') }}</li>
          </ul>
        </q-card-section>
      </q-card>

      <div class="row justify-end">
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="sym_r_save"
          :label="t('common.save')"
          :loading="savePortalMutation.isPending.value"
          @click="save"
        />
      </div>
    </template>
  </div>
</template>
