<script setup lang="ts">
import { ref } from 'vue';
import { copyToClipboard } from 'quasar';
import { useI18n } from 'vue-i18n';

import useNotify from 'src/modules/shared/composables/useNotify';
import useUpdateStatus from '../composables/useUpdateStatus';

const UPDATE_COMMAND = 'resolvo update';

const { t } = useI18n();
const { successNotify } = useNotify();
const { status, showBanner, dismiss } = useUpdateStatus();
const isHowToOpen = ref(false);

const copyCommand = async () => {
  try {
    await copyToClipboard(UPDATE_COMMAND);
    successNotify(t('common.copied'));
  } catch {
    // el comando queda visible para copiarlo a mano
  }
};
</script>

<template>
  <q-banner v-if="showBanner && status" dense class="update-banner print-hide">
    <template #avatar><q-icon name="sym_r_new_releases" color="primary" /></template>
    <div>
      <span class="text-weight-medium">{{
        t('updates.available', { version: status.latest })
      }}</span>
      <span class="text-grey-8"> · {{ t('updates.current', { version: status.current }) }}</span>
    </div>
    <q-slide-transition>
      <div v-show="isHowToOpen" class="q-mt-sm text-body2">
        {{ t('updates.howTo') }}
        <div class="row items-center q-gutter-sm q-mt-xs">
          <code class="update-command">{{ UPDATE_COMMAND }}</code>
          <q-btn flat dense round size="sm" icon="sym_r_content_copy" @click="copyCommand">
            <q-tooltip>{{ t('common.copy') }}</q-tooltip>
          </q-btn>
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">{{ t('updates.safe') }}</div>
      </div>
    </q-slide-transition>
    <template #action>
      <q-btn
        v-if="status.url"
        flat
        no-caps
        color="primary"
        icon="sym_r_open_in_new"
        :label="t('updates.whatsNew')"
        :href="status.url"
        target="_blank"
        rel="noopener"
      />
      <q-btn
        flat
        no-caps
        color="primary"
        icon="sym_r_terminal"
        :label="t('updates.how')"
        @click="isHowToOpen = !isHowToOpen"
      />
      <q-btn flat no-caps color="grey-7" :label="t('updates.dismiss')" @click="dismiss" />
    </template>
  </q-banner>
</template>

<style scoped>
.update-banner {
  background: #eef3ff;
  border-bottom: 1px solid #d6e0fb;
}
.update-command {
  background: #0b2149;
  color: #fff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.9rem;
}
</style>
