<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import OrganizationForm from '../components/OrganizationForm.vue';
import SitesManager from '../components/SitesManager.vue';
import CategoriesManager from '../components/CategoriesManager.vue';
import { useCategories } from '../composables/useCategories';
import { useOrganization } from '../composables/useOrganization';
import { formatSite, useSites } from '../composables/useSites';
import type { OrganizationPayload } from '../interfaces/organization';

type SetupStep = 'organization' | 'sites' | 'categories' | 'done';

const STEP_ORDER: SetupStep[] = ['organization', 'sites', 'categories', 'done'];

const { t } = useI18n();
const router = useRouter();
const { organization, saveMutation } = useOrganization();
const { sites } = useSites();
const { categories } = useCategories();

const step = ref<SetupStep>('organization');

const activeSites = computed(() => sites.value.filter((site) => site.isActive));
const activeCategories = computed(() => categories.value.filter((item) => item.isActive));
const isDone = (target: SetupStep) => STEP_ORDER.indexOf(step.value) > STEP_ORDER.indexOf(target);

const saveOrganization = async (payload: OrganizationPayload) => {
  await saveMutation.mutateAsync(payload);
  step.value = 'sites';
};

const finish = () => void router.push({ name: 'dashboard' });
</script>

<template>
  <q-page padding>
    <div class="setup-container">
      <div class="q-mb-md">
        <div class="page-title">{{ t('setup.title') }}</div>
        <div class="text-grey-7">{{ t('setup.subtitle') }}</div>
      </div>

      <q-stepper v-model="step" animated flat bordered color="primary" alternative-labels>
        <q-step
          name="organization"
          :title="t('setup.steps.organization')"
          icon="sym_r_apartment"
          :done="isDone('organization')"
        >
          <div class="text-body2 text-grey-8 q-mb-md">{{ t('setup.organizationIntro') }}</div>
          <OrganizationForm
            :organization="organization"
            :submit-label="t('setup.continue')"
            submit-icon="sym_r_arrow_forward"
            :loading="saveMutation.isPending.value"
            @submit="saveOrganization"
          />
        </q-step>

        <q-step
          name="sites"
          :title="t('setup.steps.sites')"
          icon="sym_r_store"
          :done="isDone('sites')"
        >
          <SitesManager />
          <q-stepper-navigation class="row justify-end q-gutter-sm">
            <q-btn flat no-caps :label="t('setup.back')" @click="step = 'organization'" />
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon-right="sym_r_arrow_forward"
              :label="t('setup.continue')"
              @click="step = 'categories'"
            />
          </q-stepper-navigation>
        </q-step>

        <q-step
          name="categories"
          :title="t('setup.steps.categories')"
          icon="sym_r_category"
          :done="isDone('categories')"
        >
          <CategoriesManager />
          <q-stepper-navigation class="row justify-end q-gutter-sm">
            <q-btn flat no-caps :label="t('setup.back')" @click="step = 'sites'" />
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon-right="sym_r_arrow_forward"
              :label="t('setup.continue')"
              @click="step = 'done'"
            />
          </q-stepper-navigation>
        </q-step>

        <q-step name="done" :title="t('setup.steps.done')" icon="sym_r_task_alt">
          <div class="column items-center text-center q-py-md q-gutter-sm">
            <q-icon name="sym_r_verified" size="56px" color="positive" />
            <div class="text-h6">{{ t('setup.doneTitle', { name: organization?.name ?? '' }) }}</div>
            <div class="text-body2 text-grey-8">
              {{
                activeSites.length
                  ? t('setup.doneSites', {
                      n: activeSites.length,
                      sites: activeSites.map(formatSite).join(', '),
                    })
                  : t('setup.doneNoSites')
              }}
            </div>
            <div class="text-body2 text-grey-8">
              {{
                activeCategories.length
                  ? t('setup.doneCategories', { n: activeCategories.length })
                  : t('setup.doneNoCategories')
              }}
            </div>
            <div class="text-caption text-grey-7">{{ t('setup.doneHint') }}</div>
          </div>
          <q-stepper-navigation class="row justify-end q-gutter-sm">
            <q-btn flat no-caps :label="t('setup.back')" @click="step = 'categories'" />
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon-right="sym_r_rocket_launch"
              :label="t('setup.finish')"
              @click="finish"
            />
          </q-stepper-navigation>
        </q-step>
      </q-stepper>
    </div>
  </q-page>
</template>

<style scoped>
.setup-container {
  max-width: 960px;
  margin: 0 auto;
}
</style>
