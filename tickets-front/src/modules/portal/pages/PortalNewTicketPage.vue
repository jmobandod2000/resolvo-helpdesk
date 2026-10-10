<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';

import useHandlerErrors from 'src/modules/shared/composables/useHandlerErrors';
import { createPortalTicket } from '../api/portalApi';
import usePortalConfig from '../composables/usePortalConfig';
import usePortalStorage from '../composables/usePortalStorage';
import { PortalRoutes } from '../interfaces/portal';

type Step = 'category' | 'details' | 'requester';

const TITLE_MIN = 5;
const TITLE_MAX = 120;
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 3000;
const NO_CATEGORY = 0;

const { t } = useI18n();
const router = useRouter();
const { handleApiResponseError } = useHandlerErrors();
const { isEnabled, sites, categories, isLoading } = usePortalConfig();
const { loadProfile, saveProfile, saveTicket } = usePortalStorage();

const startedAt = Date.now();
const step = ref<Step>('category');
const categoryId = ref<number | null>(null);
const title = ref('');
const description = ref('');
const urgent = ref(false);
const requesterName = ref('');
const requesterArea = ref('');
const requesterEmail = ref('');
const siteId = ref<number | null>(null);
const rememberMe = ref(true);
const honeypot = ref('');

const detailsForm = ref<{ validate: () => Promise<boolean> } | null>(null);
const requesterForm = ref<{ validate: () => Promise<boolean> } | null>(null);

const hasCategories = computed(() => categories.value.length > 0);
const hasSites = computed(() => sites.value.length > 0);
const siteOptions = computed(() => sites.value.map((site) => ({ value: site.id, label: site.label })));

const selectedCategoryName = computed(() =>
  categoryId.value
    ? (categories.value.find((item) => item.id === categoryId.value)?.name ?? '')
    : t('portal.new.notSure'),
);
const selectedSiteName = computed(
  () => sites.value.find((site) => site.id === siteId.value)?.label ?? '—',
);

const trimmedLength = (value: string) => value.trim().length;
const titleRule = (value: string) =>
  trimmedLength(value) >= TITLE_MIN || t('portal.new.rules.title', { n: TITLE_MIN });
const descriptionRule = (value: string) =>
  trimmedLength(value) >= DESCRIPTION_MIN ||
  t('portal.new.rules.description', { n: DESCRIPTION_MIN });
const nameRule = (value: string) => trimmedLength(value) >= 2 || t('portal.new.rules.name');
const emailRule = (value: string) =>
  !value?.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || t('auth.invalidEmail');
const siteRule = (value: number | null) => !hasSites.value || !!value || t('portal.new.rules.site');

onMounted(() => {
  const profile = loadProfile();
  if (!profile) return;
  requesterName.value = profile.requesterName ?? '';
  requesterArea.value = profile.requesterArea ?? '';
  requesterEmail.value = profile.requesterEmail ?? '';
  siteId.value = profile.siteId ?? null;
});

watch(
  [isLoading, hasCategories],
  ([loading, withCategories]) => {
    if (!loading && !withCategories && step.value === 'category') step.value = 'details';
  },
  { immediate: true },
);

watch(sites, (options) => {
  if (siteId.value && !options.some((site) => site.id === siteId.value)) siteId.value = null;
  if (!siteId.value && options.length === 1) siteId.value = options[0]!.id;
});

const chooseCategory = (id: number) => {
  categoryId.value = id === NO_CATEGORY ? null : id;
  step.value = 'details';
};

const goToRequester = async () => {
  if (await detailsForm.value?.validate()) step.value = 'requester';
};

const mutation = useMutation({
  mutationFn: createPortalTicket,
  onSuccess: (created) => {
    if (rememberMe.value)
      saveProfile({
        requesterName: requesterName.value.trim(),
        requesterArea: requesterArea.value.trim(),
        requesterEmail: requesterEmail.value.trim(),
        siteId: siteId.value,
      });
    saveTicket({
      code: created.code,
      title: title.value.trim(),
      token: created.token,
      createdAt: new Date().toISOString(),
    });
    void router.replace({
      name: PortalRoutes.TRACK,
      params: { token: created.token },
      query: { new: '1' },
    });
  },
  onError: handleApiResponseError,
});

const submit = async () => {
  if (mutation.isPending.value) return;
  if (!(await requesterForm.value?.validate())) return;

  mutation.mutate({
    title: title.value.trim(),
    description: description.value.trim(),
    requesterName: requesterName.value.trim(),
    ...(requesterArea.value.trim() && { requesterArea: requesterArea.value.trim() }),
    ...(requesterEmail.value.trim() && { requesterEmail: requesterEmail.value.trim() }),
    ...(siteId.value && { siteId: siteId.value }),
    ...(categoryId.value && { categoryId: categoryId.value }),
    urgent: urgent.value,
    website: honeypot.value,
    elapsedMs: Date.now() - startedAt,
  });
};
</script>

<template>
  <q-page class="portal-page">
    <div class="portal-container">
      <q-btn
        flat
        dense
        no-caps
        color="primary"
        icon="sym_r_arrow_back"
        :label="t('portal.backHome')"
        :to="{ name: PortalRoutes.HOME }"
        class="q-mb-sm"
      />

      <div v-if="isLoading" class="row justify-center q-pa-xl">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <q-card v-else-if="!isEnabled" flat bordered class="text-center q-pa-lg">
        <q-icon name="sym_r_construction" size="48px" color="grey-6" />
        <div class="text-h6 q-mt-sm">{{ t('portal.disabled.title') }}</div>
      </q-card>

      <template v-else>
        <div class="portal-title q-mb-md">{{ t('portal.new.title') }}</div>

        <q-stepper
          v-model="step"
          flat
          bordered
          animated
          color="primary"
          active-color="primary"
          done-color="positive"
          class="portal-stepper"
        >
          <q-step
            v-if="hasCategories"
            name="category"
            :title="t('portal.new.steps.category')"
            icon="sym_r_category"
            :done="step !== 'category'"
          >
            <div class="step-question">{{ t('portal.new.categoryQuestion') }}</div>
            <div class="row q-col-gutter-sm q-mt-xs">
              <div v-for="category in categories" :key="category.id" class="col-12 col-sm-6">
                <q-card
                  v-ripple
                  flat
                  bordered
                  tabindex="0"
                  class="choice-card cursor-pointer full-height"
                  :class="{ 'choice-card--active': categoryId === category.id }"
                  @click="chooseCategory(category.id)"
                  @keyup.enter="chooseCategory(category.id)"
                >
                  <q-card-section class="q-py-sm">
                    <div class="text-subtitle1 text-weight-medium">{{ category.name }}</div>
                    <div v-if="category.description" class="text-caption text-grey-7">
                      {{ category.description }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-sm-6">
                <q-card
                  v-ripple
                  flat
                  bordered
                  tabindex="0"
                  class="choice-card choice-card--neutral cursor-pointer full-height"
                  @click="chooseCategory(NO_CATEGORY)"
                  @keyup.enter="chooseCategory(NO_CATEGORY)"
                >
                  <q-card-section class="q-py-sm row items-center no-wrap q-gutter-sm">
                    <q-icon name="sym_r_help" size="22px" color="grey-7" />
                    <div>
                      <div class="text-subtitle1 text-weight-medium">{{ t('portal.new.notSure') }}</div>
                      <div class="text-caption text-grey-7">{{ t('portal.new.notSureHint') }}</div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-step>

          <q-step
            name="details"
            :title="t('portal.new.steps.details')"
            icon="sym_r_edit_note"
            :done="step === 'requester'"
          >
            <q-form ref="detailsForm" class="q-gutter-md" @submit.prevent="goToRequester">
              <div class="step-question">{{ t('portal.new.detailsQuestion') }}</div>
              <q-input
                v-model="title"
                :label="t('portal.new.titleLabel')"
                :placeholder="t('portal.new.titlePlaceholder')"
                :maxlength="TITLE_MAX"
                :rules="[titleRule]"
                outlined
                autofocus
                counter
              />
              <q-input
                v-model="description"
                type="textarea"
                :label="t('portal.new.descriptionLabel')"
                :placeholder="t('portal.new.descriptionPlaceholder')"
                :maxlength="DESCRIPTION_MAX"
                :rules="[descriptionRule]"
                outlined
                autogrow
                counter
                input-style="min-height: 120px"
              />
              <div>
                <div class="text-body2 text-weight-medium q-mb-xs">{{ t('portal.new.urgencyQuestion') }}</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-card
                      v-ripple
                      flat
                      bordered
                      tabindex="0"
                      class="choice-card cursor-pointer"
                      :class="{ 'choice-card--active': !urgent }"
                      @click="urgent = false"
                      @keyup.enter="urgent = false"
                    >
                      <q-card-section class="row items-center no-wrap q-gutter-sm q-py-sm">
                        <q-icon name="sym_r_schedule" size="22px" color="primary" />
                        <div>
                          <div class="text-weight-medium">{{ t('portal.new.normal') }}</div>
                          <div class="text-caption text-grey-7">{{ t('portal.new.normalHint') }}</div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-card
                      v-ripple
                      flat
                      bordered
                      tabindex="0"
                      class="choice-card cursor-pointer"
                      :class="{ 'choice-card--urgent': urgent }"
                      @click="urgent = true"
                      @keyup.enter="urgent = true"
                    >
                      <q-card-section class="row items-center no-wrap q-gutter-sm q-py-sm">
                        <q-icon name="sym_r_priority_high" size="22px" color="negative" />
                        <div>
                          <div class="text-weight-medium">{{ t('portal.new.urgent') }}</div>
                          <div class="text-caption text-grey-7">{{ t('portal.new.urgentHint') }}</div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
              <div class="row justify-between q-gutter-sm">
                <q-btn
                  v-if="hasCategories"
                  flat
                  no-caps
                  :label="t('portal.new.back')"
                  @click="step = 'category'"
                />
                <q-space />
                <q-btn
                  type="submit"
                  unelevated
                  no-caps
                  size="lg"
                  color="primary"
                  icon-right="sym_r_arrow_forward"
                  :label="t('portal.new.next')"
                />
              </div>
            </q-form>
          </q-step>

          <q-step name="requester" :title="t('portal.new.steps.requester')" icon="sym_r_person">
            <q-form ref="requesterForm" class="q-gutter-md" autocomplete="on" @submit.prevent="submit">
              <div class="step-question">{{ t('portal.new.requesterQuestion') }}</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="requesterName"
                    :label="t('portal.new.name')"
                    :rules="[nameRule]"
                    maxlength="80"
                    autocomplete="name"
                    outlined
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="requesterArea"
                    :label="t('portal.new.area')"
                    :hint="t('portal.new.optional')"
                    maxlength="80"
                    autocomplete="organization-title"
                    outlined
                  />
                </div>
                <div v-if="hasSites" class="col-12 col-sm-6">
                  <q-select
                    v-model="siteId"
                    :options="siteOptions"
                    :label="t('portal.new.site')"
                    :rules="[siteRule]"
                    emit-value
                    map-options
                    outlined
                  />
                </div>
                <div class="col-12" :class="{ 'col-sm-6': hasSites }">
                  <q-input
                    v-model="requesterEmail"
                    type="email"
                    :label="t('portal.new.email')"
                    :hint="t('portal.new.emailHint')"
                    :rules="[emailRule]"
                    maxlength="120"
                    autocomplete="email"
                    outlined
                  />
                </div>
              </div>

              <div class="honeypot" aria-hidden="true">
                <label>
                  Website
                  <input v-model="honeypot" type="text" name="website" tabindex="-1" autocomplete="off" />
                </label>
              </div>

              <q-card flat class="summary-card">
                <q-card-section class="q-py-sm">
                  <div class="text-caption text-grey-7">{{ t('portal.new.summary') }}</div>
                  <div class="text-weight-medium">{{ title.trim() }}</div>
                  <div class="text-caption text-grey-8">
                    {{ selectedCategoryName }}
                    <template v-if="hasSites"> · {{ selectedSiteName }}</template>
                    · {{ urgent ? t('portal.new.urgent') : t('portal.new.normal') }}
                  </div>
                </q-card-section>
              </q-card>

              <q-checkbox v-model="rememberMe" :label="t('portal.new.remember')" />

              <div class="row justify-between q-gutter-sm">
                <q-btn flat no-caps :label="t('portal.new.back')" @click="step = 'details'" />
                <q-space />
                <q-btn
                  type="submit"
                  unelevated
                  no-caps
                  size="lg"
                  color="primary"
                  icon-right="sym_r_send"
                  :label="t('portal.new.send')"
                  :loading="mutation.isPending.value"
                />
              </div>
            </q-form>
          </q-step>
        </q-stepper>
      </template>
    </div>
  </q-page>
</template>

<style scoped>
.portal-page {
  padding: 16px 16px 8px;
}
.portal-container {
  max-width: 760px;
  margin: 0 auto;
}
.portal-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #0b2149;
}
.portal-stepper {
  border-radius: 14px;
}
.step-question {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0b2149;
}
.choice-card {
  border-radius: 12px;
  border-width: 2px;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}
.choice-card:hover,
.choice-card:focus-visible {
  border-color: #1a4fd6;
  outline: none;
}
.choice-card--active {
  border-color: #1a4fd6;
  background: #eef3ff;
}
.choice-card--urgent {
  border-color: #c62828;
  background: #fff1f1;
}
.choice-card--neutral {
  border-style: dashed;
}
.summary-card {
  background: #f4f6f9;
  border-radius: 10px;
}
.honeypot {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>
