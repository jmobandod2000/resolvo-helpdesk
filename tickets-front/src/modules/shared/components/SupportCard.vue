<script setup lang="ts">
import { copyToClipboard } from 'quasar';
import { useI18n } from 'vue-i18n';

import useNotify from '../composables/useNotify';
import { SUPPORT_METHODS } from '../config/support';

const { t } = useI18n();
const { successNotify } = useNotify();

const copyHandle = async (handle: string) => {
  await copyToClipboard(handle);
  successNotify(t('common.copied'));
};
</script>

<template>
  <q-card v-if="SUPPORT_METHODS.length" flat bordered>
    <q-card-section>
      <div class="row items-center no-wrap q-gutter-sm">
        <q-icon name="sym_r_volunteer_activism" size="28px" color="primary" />
        <div class="section-title">{{ t('support.title') }}</div>
      </div>
      <div class="text-body2 text-grey-8 q-mt-sm">{{ t('support.message') }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section class="row q-col-gutter-lg items-center">
      <div class="col-12 col-sm">
        <q-list separator bordered class="rounded-borders">
          <q-item v-for="method in SUPPORT_METHODS" :key="method.name">
            <q-item-section avatar>
              <q-icon :name="method.icon" color="grey-8" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ method.name }}</q-item-label>
              <q-item-label v-if="method.handle" caption class="text-mono">
                {{ method.handle }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                v-if="method.url"
                flat
                dense
                no-caps
                color="primary"
                icon-right="sym_r_open_in_new"
                :label="t('support.open')"
                :href="method.url"
                target="_blank"
                rel="noopener noreferrer"
              />
              <q-btn
                v-else-if="method.handle"
                flat
                dense
                no-caps
                color="primary"
                icon="sym_r_content_copy"
                :label="t('support.copy')"
                @click="copyHandle(method.handle)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div
        v-for="method in SUPPORT_METHODS.filter((item) => item.qr)"
        :key="`${method.name}-qr`"
        class="col-12 col-sm-auto text-center"
      >
        <img :src="method.qr" :alt="t('support.qrAlt', { name: method.name })" class="support-qr" />
        <div class="text-caption text-grey-7 support-qr-hint">
          {{ t('support.qrHint', { name: method.name }) }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.support-qr {
  width: 200px;
  max-width: 100%;
  border-radius: 12px;
}
.support-qr-hint {
  max-width: 220px;
  margin: 4px auto 0;
}
.text-mono {
  font-family: 'Roboto Mono', monospace;
  letter-spacing: 0.5px;
}
</style>
