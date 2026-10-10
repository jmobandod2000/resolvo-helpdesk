<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="fullscreen column flex-center text-center q-pa-md bg-primary text-white">
    <div class="text-h2">404</div>
    <div class="text-h6 q-mb-lg">{{ t('notFound.message') }}</div>
    <q-btn color="white" text-color="primary" unelevated to="/" :label="t('notFound.back')" />
  </div>
</template>
