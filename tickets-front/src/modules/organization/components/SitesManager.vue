<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import { useI18n } from 'vue-i18n';

import SiteFormDialog from './SiteFormDialog.vue';
import { useSiteMutations, useSites } from '../composables/useSites';
import type { Site, SitePayload } from '../interfaces/organization';

const $q = useQuasar();
const { t } = useI18n();
const { sites, isFetching } = useSites();
const { createMutation, updateMutation, deleteMutation } = useSiteMutations();

const isDialogOpen = ref(false);
const selectedSite = ref<Site | null>(null);

const columns = computed<QTableColumn<Site>[]>(() => [
  { name: 'code', label: t('sites.fields.code'), field: 'code', align: 'left', sortable: true },
  { name: 'name', label: t('sites.fields.name'), field: 'name', align: 'left', sortable: true },
  {
    name: 'tickets',
    label: t('sites.fields.tickets'),
    field: (site: Site) => site._count.Tickets,
    align: 'right',
    sortable: true,
  },
  { name: 'isActive', label: t('sites.fields.status'), field: 'isActive', align: 'center' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]);

const openCreate = () => {
  selectedSite.value = null;
  isDialogOpen.value = true;
};

const openEdit = (site: Site) => {
  selectedSite.value = site;
  isDialogOpen.value = true;
};

const save = async (payload: SitePayload) => {
  if (selectedSite.value)
    await updateMutation.mutateAsync({ id: selectedSite.value.id, payload });
  else await createMutation.mutateAsync(payload);
  isDialogOpen.value = false;
};

const toggleActive = (site: Site, isActive: boolean) =>
  updateMutation.mutate({ id: site.id, payload: { isActive } });

const confirmDelete = (site: Site) => {
  $q.dialog({
    title: t('sites.deleteTitle'),
    message: site._count.Tickets
      ? t('sites.deleteWithTickets', { name: site.name, n: site._count.Tickets })
      : t('sites.deleteMessage', { name: site.name }),
    cancel: { flat: true, noCaps: true, label: t('common.cancel') },
    ok: { unelevated: true, noCaps: true, color: 'negative', label: t('common.delete') },
    persistent: true,
  }).onOk(() => deleteMutation.mutate(site.id));
};
</script>

<template>
  <div class="q-gutter-md">
    <div class="row items-center q-col-gutter-sm">
      <div class="col text-body2 text-grey-8">{{ t('sites.description') }}</div>
      <div class="col-auto">
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="sym_r_add"
          :label="t('sites.add')"
          @click="openCreate"
        />
      </div>
    </div>

    <q-table
      flat
      bordered
      :rows="sites"
      :columns="columns"
      row-key="id"
      :loading="isFetching"
      :rows-per-page-options="[0]"
      hide-pagination
      :no-data-label="t('sites.empty')"
    >
      <template #body-cell-code="props">
        <q-td :props="props">
          <q-badge v-if="props.value" outline color="primary">{{ props.value }}</q-badge>
          <span v-else class="text-grey-5">—</span>
        </q-td>
      </template>
      <template #body-cell-isActive="props">
        <q-td :props="props">
          <q-toggle
            :model-value="props.row.isActive"
            color="positive"
            dense
            @update:model-value="(value) => toggleActive(props.row, value)"
          >
            <q-tooltip>{{ props.row.isActive ? t('sites.active') : t('sites.inactive') }}</q-tooltip>
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

    <div class="text-caption text-grey-7 row items-center no-wrap q-gutter-xs">
      <q-icon name="sym_r_info" size="16px" />
      <span>{{ t('sites.generalHint') }}</span>
    </div>

    <SiteFormDialog
      v-model="isDialogOpen"
      :site="selectedSite"
      :loading="createMutation.isPending.value || updateMutation.isPending.value"
      @submit="save"
    />
  </div>
</template>
