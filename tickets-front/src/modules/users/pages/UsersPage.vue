<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QTableColumn } from 'quasar';

import useDates from 'src/modules/shared/composables/useDates';
import UserFormDialog from '../components/UserFormDialog.vue';
import { useUsersQuery } from '../composables/useUsersQuery';
import { useUserMutations } from '../composables/useUserMutations';
import type { User, UserPayload } from '../interfaces/user';

const { t } = useI18n();
const { users, isFetching } = useUsersQuery();
const { createMutation, updateMutation } = useUserMutations();
const { formatDate } = useDates();

const isDialogOpen = ref(false);
const selectedUser = ref<User | null>(null);

const columns = computed<QTableColumn<User>[]>(() => [
  { name: 'name', label: t('users.fields.name'), field: 'name', align: 'left', sortable: true },
  { name: 'email', label: t('users.fields.email'), field: 'email', align: 'left' },
  {
    name: 'roles',
    label: t('users.fields.role'),
    field: 'roles',
    align: 'left',
    format: (value: string) => t(value === 'admin' ? 'enums.role.admin' : 'enums.role.user'),
  },
  { name: 'isActive', label: t('users.fields.status'), field: 'isActive', align: 'center' },
  {
    name: 'createdAt',
    label: t('users.fields.createdAt'),
    field: 'createdAt',
    align: 'left',
    format: (value: string) => formatDate(value),
  },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]);

const openCreate = () => {
  selectedUser.value = null;
  isDialogOpen.value = true;
};

const openEdit = (user: User) => {
  selectedUser.value = user;
  isDialogOpen.value = true;
};

const save = async (payload: UserPayload) => {
  if (selectedUser.value)
    await updateMutation.mutateAsync({ id: selectedUser.value.id, payload });
  else await createMutation.mutateAsync(payload);
  isDialogOpen.value = false;
};
</script>

<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="page-title col">{{ t('users.title') }}</div>
      <q-btn color="primary" unelevated icon="sym_r_person_add" :label="t('common.new')" @click="openCreate" />
    </div>

    <q-table
      :rows="users"
      :columns="columns"
      row-key="id"
      :loading="isFetching"
      flat
      bordered
      :rows-per-page-options="[0]"
      hide-pagination
    >
      <template #body-cell-isActive="{ value }">
        <q-td class="text-center">
          <q-badge :color="value ? 'positive' : 'grey-6'" :label="value ? t('users.active') : t('users.inactive')" />
        </q-td>
      </template>
      <template #body-cell-actions="{ row }">
        <q-td class="text-right">
          <q-btn flat dense round icon="sym_r_edit" @click="openEdit(row)" />
        </q-td>
      </template>
    </q-table>

    <UserFormDialog
      v-model="isDialogOpen"
      :user="selectedUser"
      :is-saving="createMutation.isPending.value || updateMutation.isPending.value"
      @save="save"
    />
  </q-page>
</template>
