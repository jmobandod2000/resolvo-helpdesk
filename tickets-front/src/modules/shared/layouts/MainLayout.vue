<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useAuth from 'src/modules/auth/composables/useAuth';
import { usePublicProfile } from 'src/modules/organization/composables/useOrganization';
import { OrganizationRoutes } from 'src/modules/organization/interfaces/organization';
import WelcomeDialog from 'src/modules/guide/components/WelcomeDialog.vue';
import LanguageSelector from '../components/LanguageSelector.vue';
import AppFooterLinks from '../components/AppFooterLinks.vue';
import resolvoIcon from 'src/assets/brand/resolvo-icon.png';

interface MenuLink {
  labelKey: string;
  icon: string;
  to: { name: string };
  adminOnly?: boolean;
}

const { t } = useI18n();
const { user, isAdmin, logout } = useAuth();
const route = useRoute();
const router = useRouter();
const { organizationName, isConfigured, isFetched } = usePublicProfile();
const isDrawerOpen = ref(true);
const isSetupRoute = computed(() => route.name === OrganizationRoutes.SETUP);

watch(
  [isFetched, isConfigured, isAdmin],
  ([fetched, configured, admin]) => {
    if (fetched && !configured && admin && !isSetupRoute.value)
      void router.replace({ name: OrganizationRoutes.SETUP });
  },
  { immediate: true },
);

const links: MenuLink[] = [
  { labelKey: 'nav.dashboard', icon: 'sym_r_monitoring', to: { name: 'dashboard' } },
  { labelKey: 'nav.tickets', icon: 'sym_r_confirmation_number', to: { name: 'tickets-list' } },
  { labelKey: 'nav.newTicket', icon: 'sym_r_add_circle', to: { name: 'ticket-create' } },
  { labelKey: 'nav.reports', icon: 'sym_r_summarize', to: { name: 'reports' } },
  { labelKey: 'nav.users', icon: 'sym_r_group', to: { name: 'users' }, adminOnly: true },
  {
    labelKey: 'nav.settings',
    icon: 'sym_r_settings',
    to: { name: OrganizationRoutes.SETTINGS },
    adminOnly: true,
  },
  { labelKey: 'guide.menu', icon: 'sym_r_school', to: { name: 'guide' } },
  { labelKey: 'nav.about', icon: 'sym_r_info', to: { name: 'about' } },
];

const visibleLinks = computed(() => links.filter((link) => !link.adminOnly || isAdmin.value));
</script>

<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-btn flat dense round icon="sym_r_menu" @click="isDrawerOpen = !isDrawerOpen" />
        <q-toolbar-title class="text-weight-medium row items-center no-wrap">
          <img :src="resolvoIcon" alt="" style="width: 30px; height: 30px" class="q-mr-sm" />
          <span>{{ t('app.name') }}</span>
          <template v-if="organizationName">
            <q-separator vertical dark inset class="q-mx-sm gt-xs" />
            <span class="organization-name gt-xs ellipsis">{{ organizationName }}</span>
          </template>
        </q-toolbar-title>
        <LanguageSelector dark class="q-mr-sm" />
        <div class="q-mr-sm gt-xs">{{ user.name }}</div>
        <q-btn flat dense round icon="sym_r_logout" @click="logout">
          <q-tooltip>{{ t('nav.logout') }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="isDrawerOpen" show-if-above bordered :width="230">
      <div class="column full-height">
        <q-list padding class="col">
          <q-item
            v-for="link in visibleLinks"
            :key="link.labelKey"
            :to="link.to"
            clickable
            exact
            active-class="text-primary bg-blue-1"
          >
            <q-item-section avatar><q-icon :name="link.icon" /></q-item-section>
            <q-item-section>{{ t(link.labelKey) }}</q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <q-banner
        v-if="isFetched && !isConfigured && !isAdmin"
        dense
        class="bg-orange-1 text-orange-10 print-hide"
      >
        <template #avatar><q-icon name="sym_r_info" /></template>
        {{ t('setup.pendingForUsers') }}
      </q-banner>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-white q-py-xs print-hide">
      <AppFooterLinks show-about />
    </q-footer>

    <WelcomeDialog v-if="!isSetupRoute" />
  </q-layout>
</template>

<style scoped>
.organization-name {
  font-size: 0.95rem;
  font-weight: 400;
  opacity: 0.85;
}
</style>
