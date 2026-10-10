<script setup lang="ts">
import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import { useDashboardManageStore } from '../composables/useDashboardManageStore';

const { catalogs } = useCatalogs();
const { filters, setFilters, resetFilters } = useDashboardManageStore();

const weekOptions = [
  { value: 8, label: '8 semanas' },
  { value: 12, label: '12 semanas' },
  { value: 26, label: '26 semanas' },
];
</script>

<template>
  <q-card flat bordered class="q-pa-sm q-mb-md">
    <div class="row q-col-gutter-sm items-center">
      <div class="col-12 col-sm-3">
        <q-select
          :model-value="filters.company"
          :options="catalogs.companies"
          label="Sede"
          outlined
          dense
          emit-value
          map-options
          clearable
          @update:model-value="(value) => setFilters({ company: value })"
        />
      </div>
      <div class="col-6 col-sm-3">
        <q-input
          :model-value="filters.from"
          label="Reportado desde"
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
          label="Reportado hasta"
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
          label="Tendencia"
          outlined
          dense
          emit-value
          map-options
          @update:model-value="(value) => setFilters({ weeks: value })"
        />
      </div>
      <div class="col-6 col-sm-1 text-right">
        <q-btn flat round color="primary" icon="sym_r_filter_alt_off" @click="resetFilters">
          <q-tooltip>Limpiar filtros</q-tooltip>
        </q-btn>
      </div>
    </div>
  </q-card>
</template>
