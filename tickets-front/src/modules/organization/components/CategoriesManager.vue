<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import { useI18n } from 'vue-i18n';

import CategoryFormDialog from './CategoryFormDialog.vue';
import {
  SUGGESTED_CATEGORY_KEYS,
  useCategories,
  useCategoryMutations,
} from '../composables/useCategories';
import type { Category, CategoryPayload } from '../interfaces/organization';

const $q = useQuasar();
const { t } = useI18n();
const { categories, isFetching } = useCategories();
const { createMutation, createManyMutation, updateMutation, deleteMutation } =
  useCategoryMutations();

const isDialogOpen = ref(false);
const selectedCategory = ref<Category | null>(null);

const columns = computed<QTableColumn<Category>[]>(() => [
  {
    name: 'name',
    label: t('categories.fields.name'),
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'description',
    label: t('categories.fields.description'),
    field: 'description',
    align: 'left',
    format: (value: string | null) => value ?? '—',
  },
  {
    name: 'tickets',
    label: t('categories.fields.tickets'),
    field: (category: Category) => category._count.Tickets,
    align: 'right',
    sortable: true,
  },
  { name: 'isActive', label: t('categories.fields.status'), field: 'isActive', align: 'center' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]);

const missingSuggestions = computed<CategoryPayload[]>(() => {
  const existing = new Set(categories.value.map((category) => category.name.toLowerCase()));
  return SUGGESTED_CATEGORY_KEYS.map((key) => ({
    name: t(`categories.suggested.${key}.name`),
    description: t(`categories.suggested.${key}.description`),
  })).filter((suggestion) => !existing.has(suggestion.name.toLowerCase()));
});

const openCreate = () => {
  selectedCategory.value = null;
  isDialogOpen.value = true;
};

const openEdit = (category: Category) => {
  selectedCategory.value = category;
  isDialogOpen.value = true;
};

const save = async (payload: CategoryPayload) => {
  if (selectedCategory.value)
    await updateMutation.mutateAsync({ id: selectedCategory.value.id, payload });
  else await createMutation.mutateAsync(payload);
  isDialogOpen.value = false;
};

const addSuggestions = () => createManyMutation.mutate(missingSuggestions.value);

const toggleActive = (category: Category, isActive: boolean) =>
  updateMutation.mutate({ id: category.id, payload: { isActive } });

const confirmDelete = (category: Category) => {
  $q.dialog({
    title: t('categories.deleteTitle'),
    message: category._count.Tickets
      ? t('categories.deleteWithTickets', { name: category.name, n: category._count.Tickets })
      : t('categories.deleteMessage', { name: category.name }),
    cancel: { flat: true, noCaps: true, label: t('common.cancel') },
    ok: { unelevated: true, noCaps: true, color: 'negative', label: t('common.delete') },
    persistent: true,
  }).onOk(() => deleteMutation.mutate(category.id));
};
</script>

<template>
  <div class="q-gutter-md">
    <div class="row items-center q-col-gutter-sm">
      <div class="col-12 col-md text-body2 text-grey-8">{{ t('categories.description') }}</div>
      <div class="col-12 col-md-auto row q-gutter-sm justify-end">
        <q-btn
          v-if="missingSuggestions.length"
          outline
          no-caps
          color="primary"
          icon="sym_r_auto_awesome"
          :label="t('categories.addSuggested', { n: missingSuggestions.length })"
          :loading="createManyMutation.isPending.value"
          @click="addSuggestions"
        >
          <q-tooltip max-width="320px">
            {{ missingSuggestions.map((item) => item.name).join(', ') }}
          </q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="sym_r_add"
          :label="t('categories.add')"
          @click="openCreate"
        />
      </div>
    </div>

    <q-table
      flat
      bordered
      :rows="categories"
      :columns="columns"
      row-key="id"
      :loading="isFetching"
      :rows-per-page-options="[0]"
      hide-pagination
      :no-data-label="t('categories.empty')"
    >
      <template #body-cell-isActive="props">
        <q-td :props="props">
          <q-toggle
            :model-value="props.row.isActive"
            color="positive"
            dense
            @update:model-value="(value) => toggleActive(props.row, value)"
          >
            <q-tooltip>
              {{ props.row.isActive ? t('categories.active') : t('categories.inactive') }}
            </q-tooltip>
          </q-toggle>
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round dense icon="sym_r_edit" color="primary" @click="openEdit(props.row)">
            <q-tooltip>{{ t('common.edit') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="sym_r_delete"
            color="negative"
            @click="confirmDelete(props.row)"
          >
            <q-tooltip>{{ t('common.delete') }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <CategoryFormDialog
      v-model="isDialogOpen"
      :category="selectedCategory"
      :loading="createMutation.isPending.value || updateMutation.isPending.value"
      @submit="save"
    />
  </div>
</template>
