<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import resolvoIcon from 'src/assets/brand/resolvo-icon.png';
import LanguageSelector from 'src/modules/shared/components/LanguageSelector.vue';
import AppFooterLinks from 'src/modules/shared/components/AppFooterLinks.vue';
import usePortalConfig from '../composables/usePortalConfig';
import { PortalRoutes } from '../interfaces/portal';

const { t } = useI18n();
const { config } = usePortalConfig();
</script>

<template>
  <q-layout view="hHh lpr fff" class="portal-layout">
    <q-header bordered class="bg-white text-dark">
      <q-toolbar class="portal-toolbar">
        <router-link :to="{ name: PortalRoutes.HOME }" class="row items-center no-wrap portal-brand">
          <img :src="resolvoIcon" alt="" class="portal-logo" />
          <div class="column">
            <span class="portal-org ellipsis">{{ config?.organizationName ?? t('app.name') }}</span>
            <span class="text-caption text-grey-7">{{ t('portal.helpCenter') }}</span>
          </div>
        </router-link>
        <q-space />
        <LanguageSelector />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-transparent q-py-md">
      <div class="column items-center q-gutter-xs">
        <router-link :to="{ name: 'login' }" class="text-caption text-grey-7 staff-link">
          <q-icon name="sym_r_lock" size="14px" /> {{ t('portal.staffAccess') }}
        </router-link>
        <AppFooterLinks />
      </div>
    </q-footer>
  </q-layout>
</template>

<style scoped>
.portal-layout {
  background: #f4f6f9;
}
.portal-toolbar {
  max-width: 880px;
  width: 100%;
  margin: 0 auto;
  min-height: 64px;
}
.portal-brand {
  color: inherit;
  text-decoration: none;
  gap: 10px;
  min-width: 0;
}
.portal-logo {
  width: 36px;
  height: 36px;
}
.portal-org {
  font-size: 1.05rem;
  font-weight: 600;
  color: #0b2149;
  max-width: 52vw;
}
.staff-link {
  text-decoration: none;
}
.staff-link:hover {
  text-decoration: underline;
}
</style>
