<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import OrganizationForm from '../components/OrganizationForm.vue';
import SitesManager from '../components/SitesManager.vue';
import CategoriesManager from '../components/CategoriesManager.vue';
import { useOrganization } from '../composables/useOrganization';

type SettingsTab = 'organization' | 'sites' | 'categories';

const { t } = useI18n();
const { organization, saveMutation } = useOrganization();
const tab = ref<SettingsTab>('organization');
</script>

<template>
  <q-page padding>
    <div class="settings-container">
      <div class="q-mb-md">
        <div class="page-title">{{ t('settings.title') }}</div>
        <div class="text-grey-7">{{ t('settings.subtitle') }}</div>
      </div>

      <q-card flat bordered>
        <q-tabs
          v-model="tab"
          dense
          no-caps
          align="left"
          active-color="primary"
          indicator-color="primary"
          class="text-grey-8"
        >
          <q-tab name="organization" icon="sym_r_apartment" :label="t('settings.tabs.organization')" />
          <q-tab name="sites" icon="sym_r_store" :label="t('settings.tabs.sites')" />
          <q-tab
            name="categories"
            icon="sym_r_category"
            :label="t('settings.tabs.categories')"
          />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="organization">
            <OrganizationForm
              :organization="organization"
              :submit-label="t('common.save')"
              submit-icon="sym_r_save"
              :loading="saveMutation.isPending.value"
              @submit="(payload) => saveMutation.mutate(payload)"
            />
          </q-tab-panel>
          <q-tab-panel name="sites">
            <SitesManager />
          </q-tab-panel>
          <q-tab-panel name="categories">
            <CategoriesManager />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.settings-container {
  max-width: 960px;
  margin: 0 auto;
}
</style>
