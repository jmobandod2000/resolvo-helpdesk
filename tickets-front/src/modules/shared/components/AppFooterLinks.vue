<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { APP_INFO } from '../config/app';

defineProps<{ dark?: boolean; showAbout?: boolean }>();

const { t } = useI18n();
</script>

<template>
  <div class="footer-links text-caption" :class="dark ? 'text-blue-1' : 'text-grey-7'">
    <span>© {{ APP_INFO.year }} {{ t('app.name') }} · v{{ APP_INFO.version }}</span>
    <span class="separator">·</span>
    <a :href="APP_INFO.licenseUrl" target="_blank" rel="noopener noreferrer">
      {{ t('footer.license', { license: APP_INFO.license }) }}
    </a>
    <span class="separator">·</span>
    <a :href="APP_INFO.repositoryUrl" target="_blank" rel="noopener noreferrer">GitHub</a>
    <template v-if="showAbout">
      <span class="separator">·</span>
      <router-link :to="{ name: 'about' }">{{ t('footer.about') }}</router-link>
      <span class="separator">·</span>
      <router-link :to="{ name: 'about', query: { section: 'support' } }">
        {{ t('footer.support') }}
      </router-link>
    </template>
  </div>
</template>

<style scoped>
.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 2px 6px;
  text-align: center;
}
.footer-links a {
  color: inherit;
  text-decoration: none;
}
.footer-links a:hover {
  text-decoration: underline;
}
.separator {
  opacity: 0.6;
}
</style>
