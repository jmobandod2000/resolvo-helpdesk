<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSites } from 'src/modules/organization/composables/useSites';
import { useDashboardManageStore } from '../composables/useDashboardManageStore';

const { t } = useI18n();
const { allSiteOptions } = useSites();
const { filters, setFilters, resetFilters } = useDashboardManageStore();

const weekOptions = computed(() =>
  [8, 12, 26].map((weeks) => ({ value: weeks, label: t('dashboard.filters.weeks', { n: weeks }) })),
);
</script>

<template>
  <q-card flat bordered class="q-pa-sm q-mb-md">
    <div class="row q-col-gutter-sm items-center">
      <div class="col-12 col-sm-3">
        <q-select
          :model-value="filters.siteId"
          :options="allSiteOptions"
          :label="t('dashboard.filters.site')"
          outlined
          dense
          emit-value
          map-options
          clearable
          @update:model-value="(value) => setFilters({ siteId: value })"
        />
      </div>
      <div class="col-6 col-sm-3">
        <q-input
          :model-value="filters.from"
          :label="t('dashboard.filters.from')"
          type="date"
          outlined
          dense
          stack-label
          clearable
          @update:model-value="(value) => setFilters({ from: (value as string) || null })"
        />
      </div>
      <div class="col-6 col-sm-3">
        <q-input
          :model-value="filters.to"
          :label="t('dashboard.filters.to')"
          type="date"
          outlined
          dense
          stack-label
          clearable
          @update:model-value="(value) => setFilters({ to: (value as string) || null })"
        />
      </div>
      <div class="col-6 col-sm-2">
        <q-select
          :model-value="filters.weeks"
          :options="weekOptions"
          :label="t('dashboard.filters.trend')"
          outlined
          dense
          emit-value
          map-options
          @update:model-value="(value) => setFilters({ weeks: value })"
        />
      </div>
      <div class="col-6 col-sm-1 text-right">
        <q-btn flat round color="primary" icon="sym_r_filter_alt_off" @click="resetFilters">
          <q-tooltip>{{ t('common.clearFilters') }}</q-tooltip>
        </q-btn>
      </div>
    </div>
  </q-card>
</template>
