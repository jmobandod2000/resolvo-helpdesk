<script setup lang="ts">
import { ref, watch } from 'vue';

import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import { useUsersQuery } from 'src/modules/users/composables/useUsersQuery';
import { useTicketsManageStore } from '../composables/useTicketsManageStore';

const { catalogs } = useCatalogs();
const { userOptions } = useUsersQuery();
const { filters, setFilters, resetFilters } = useTicketsManageStore();

const searchText = ref(filters.value.search);
let searchTimer: ReturnType<typeof setTimeout> | undefined;

watch(searchText, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => setFilters({ search: value }), 400);
});

watch(
  () => filters.value.search,
  (value) => {
    if (value !== searchText.value) searchText.value = value;
  },
);
</script>

<template>
  <q-card flat bordered class="q-pa-sm q-mb-md">
    <div class="row q-col-gutter-sm items-center">
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchText"
          outlined
          dense
          clearable
          placeholder="Buscar por código, título, solicitante, producto o documento"
        >
          <template #prepend><q-icon name="sym_r_search" /></template>
        </q-input>
      </div>
      <div class="col-6 col-md-2">
        <q-select
          :model-value="filters.status"
          :options="catalogs.statuses"
          label="Estado"
          outlined
          dense
          multiple
          emit-value
          map-options
          clearable
          @update:model-value="(value) => setFilters({ status: value ?? [] })"
        />
      </div>
      <div class="col-6 col-md-2">
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
      <div class="col-6 col-md-2">
        <q-select
          :model-value="filters.category"
          :options="catalogs.categories"
          label="Categoría"
          outlined
          dense
          emit-value
          map-options
          clearable
          @update:model-value="(value) => setFilters({ category: value })"
        />
      </div>
      <div class="col-6 col-md-2">
        <q-select
          :model-value="filters.priority"
          :options="catalogs.priorities"
          label="Prioridad"
          outlined
          dense
          emit-value
          map-options
          clearable
          @update:model-value="(value) => setFilters({ priority: value })"
        />
      </div>
      <div class="col-6 col-md-3">
        <q-select
          :model-value="filters.rootCause"
          :options="catalogs.rootCauses"
          label="Causa raíz"
          outlined
          dense
          emit-value
          map-options
          clearable
          @update:model-value="(value) => setFilters({ rootCause: value })"
        />
      </div>
      <div class="col-6 col-md-3">
        <q-select
          :model-value="filters.assigneeId"
          :options="userOptions"
          label="Asignado a"
          outlined
          dense
          emit-value
          map-options
          clearable
          @update:model-value="(value) => setFilters({ assigneeId: value })"
        />
      </div>
      <div class="col-6 col-md-3">
        <q-toggle
          :model-value="filters.onlyOpen"
          label="Solo abiertos"
          @update:model-value="(value) => setFilters({ onlyOpen: value })"
        />
      </div>
      <div class="col-6 col-md-3 text-right">
        <q-btn flat color="primary" icon="sym_r_filter_alt_off" label="Limpiar" @click="resetFilters" />
      </div>
    </div>
  </q-card>
</template>
