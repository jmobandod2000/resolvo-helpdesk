<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import useLocale from '../composables/useLocale';

defineProps<{ dark?: boolean }>();

const { t } = useI18n();
const { locale, locales, setLocale } = useLocale();
</script>

<template>
  <q-btn-dropdown
    flat
    dense
    no-caps
    icon="sym_r_translate"
    :label="t(`language.${locale}`)"
    :text-color="dark ? 'white' : 'primary'"
  >
    <q-list dense>
      <q-item-label header>{{ t('language.label') }}</q-item-label>
      <q-item
        v-for="option in locales"
        :key="option"
        v-close-popup
        clickable
        :active="option === locale"
        active-class="text-primary"
        @click="setLocale(option)"
      >
        <q-item-section>{{ t(`language.${option}`) }}</q-item-section>
        <q-item-section v-if="option === locale" side>
          <q-icon name="sym_r_check" color="primary" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>
