<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import { useUsersQuery } from 'src/modules/users/composables/useUsersQuery';
import { useSites } from 'src/modules/organization/composables/useSites';
import { useCategories } from 'src/modules/organization/composables/useCategories';
import { useReportsManageStore } from '../composables/useReportsManageStore';
import type { ReportGroupBy, ReportPreset } from '../interfaces/report';

const PRESETS: ReportPreset[] = [
  'thisMonth',
  'lastMonth',
  'last3Months',
  'last6Months',
  'thisYear',
  'lastYear',
  'custom',
];

const { t } = useI18n();
const { catalogs } = useCatalogs();
const { userOptions } = useUsersQuery();
const { allSiteOptions } = useSites();
const { allCategoryOptions } = useCategories();
const { filters, setFilters, setPreset, setDates, resetFilters } = useReportsManageStore();

const presetOptions = computed(() =>
  PRESETS.map((preset) => ({ value: preset, label: t(`reports.filters.presets.${preset}`) })),
);

const groupByOptions = computed(() =>
  (['month', 'week'] as ReportGroupBy[]).map((value) => ({
    value,
    label: t(`reports.filters.${value}`),
  })),
);

const isRangeInvalid = computed(
  () => !!filters.value.from && !!filters.value.to && filters.value.from > filters.value.to,
);
</script>

<template>
  <q-card flat bordered class="q-pa-sm q-mb-md print-hide">
    <div class="row q-col-gutter-sm items-start">
      <div class="col-12 col-sm-4 col-md-3">
        <q-select
          :model-value="filters.preset"
          :options="presetOptions"
          :label="t('reports.filters.preset')"
          outlined
          dense
          emit-value
          map-options
          @update:model-value="(value) => setPreset(value)"
        />
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <q-input
          :model-value="filters.from"
          :label="t('reports.filters.from')"
          type="date"
          outlined
          dense
          stack-label
          :error="isRangeInvalid"
          :error-message="t('reports.invalidRange')"
          @update:model-value="(value) => setDates({ from: String(value ?? '') })"
        />
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <q-input
          :model-value="filters.to"
          :label="t('reports.filters.to')"
          type="date"
          outlined
          dense
          stack-label
          :error="isRangeInvalid"
          @update:model-value="(value) => setDates({ to: String(value ?? '') })"
        />
      </div>
      <div class="col-12 col-sm-4 col-md-2">
        <q-btn-toggle
          :model-value="filters.groupBy"
          :options="groupByOptions"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          color="grey-2"
          text-color="grey-9"
          class="full-width group-toggle"
          @update:model-value="(value) => setFilters({ groupBy: value })"
        />
      </div>
      <div class="col-6 col-sm-4 col-md-3">
        <q-select
          :model-value="filters.siteId"
          :options="allSiteOptions"
          :label="t('reports.filters.site')"
          outlined
          dense
          emit-value
          map-options
          clearable
          @update:model-value="(value) => setFilters({ siteId: value })"
        />
      </div>
      <div class="col-6 col-sm-4 col-md-3">
        <q-select
          :model-value="filters.assigneeId"
          :options="userOptions"
          :label="t('reports.filters.assignee')"
          outlined
          dense
          emit-value
          map-options
          clearable
          @update:model-value="(value) => setFilters({ assigneeId: value })"
        />
      </div>
      <div class="col-6 col-sm-4 col-md-3">
        <q-select
          :model-value="filters.categoryId"
          :options="allCategoryOptions"
          :label="t('reports.filters.category')"
          outlined
          dense
          emit-value
          map-options
          clearable
          @update:model-value="(value) => setFilters({ categoryId: value })"
        />
      </div>
      <div class="col-6 col-sm-4 col-md-3">
        <q-select
          :model-value="filters.priority"
          :options="catalogs.priorities"
          :label="t('reports.filters.priority')"
          outlined
          dense
          emit-value
          map-options
          clearable
          @update:model-value="(value) => setFilters({ priority: value })"
        />
      </div>
      <div class="col-12 col-sm-4 col-md-3">
        <q-btn flat round color="primary" icon="sym_r_filter_alt_off" @click="resetFilters">
          <q-tooltip>{{ t('common.clearFilters') }}</q-tooltip>
        </q-btn>
      </div>
    </div>
  </q-card>
</template>

<style scoped>
.group-toggle {
  border: 1px solid rgba(0, 0, 0, 0.24);
  min-height: 40px;
}
</style>
