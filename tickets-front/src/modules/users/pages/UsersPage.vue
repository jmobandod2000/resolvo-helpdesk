<script setup lang="ts">
import { ref } from 'vue';
import type { QTableColumn } from 'quasar';

import useDates from 'src/modules/shared/composables/useDates';
import UserFormDialog from '../components/UserFormDialog.vue';
import { useUsersQuery } from '../composables/useUsersQuery';
import { useUserMutations } from '../composables/useUserMutations';
import type { User, UserPayload } from '../interfaces/user';

const { users, isFetching } = useUsersQuery();
const { createMutation, updateMutation } = useUserMutations();
const { formatDate } = useDates();

const isDialogOpen = ref(false);
const selectedUser = ref<User | null>(null);

const columns: QTableColumn<User>[] = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'email', label: 'Correo', field: 'email', align: 'left' },
  {
    name: 'roles',
    label: 'Rol',
    field: 'roles',
    align: 'left',
    format: (value: string) => (value === 'admin' ? 'Administrador' : 'Analista'),
  },
  { name: 'isActive', label: 'Estado', field: 'isActive', align: 'center' },
  {
    name: 'createdAt',
    label: 'Creado',
    field: 'createdAt',
    align: 'left',
    format: (value: string) => formatDate(value),
  },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

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
      <div class="page-title col">Usuarios</div>
      <q-btn color="primary" unelevated icon="sym_r_person_add" label="Nuevo" @click="openCreate" />
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
          <q-badge :color="value ? 'positive' : 'grey-6'" :label="value ? 'Activo' : 'Inactivo'" />
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
