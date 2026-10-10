<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { QTableColumn, QTableProps } from 'quasar';

import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import useDates from 'src/modules/shared/composables/useDates';
import TicketStatusBadge from './TicketStatusBadge.vue';
import TicketPriorityBadge from './TicketPriorityBadge.vue';
import { useTicketsQuery } from '../composables/useTicketsQuery';
import { useTicketsManageStore } from '../composables/useTicketsManageStore';
import type { Ticket } from '../interfaces/ticket';
import { TicketRoutes } from '../interfaces/ticket-routes';

const router = useRouter();
const { companyLabel, categoryLabel } = useCatalogs();
const { formatDateTime, fromNow } = useDates();
const { tickets, total, isFetching } = useTicketsQuery();
const { page, rowsPerPage, setPagination } = useTicketsManageStore();

const pagination = computed(() => ({
  page: page.value,
  rowsPerPage: rowsPerPage.value,
  rowsNumber: total.value,
}));

const columns: QTableColumn<Ticket>[] = [
  { name: 'code', label: 'Código', field: 'code', align: 'left' },
  { name: 'title', label: 'Título', field: 'title', align: 'left' },
  { name: 'requesterName', label: 'Solicitante', field: 'requesterName', align: 'left' },
  {
    name: 'company',
    label: 'Sede',
    field: 'company',
    align: 'left',
    format: (value: string) => companyLabel(value),
  },
  {
    name: 'category',
    label: 'Categoría',
    field: 'category',
    align: 'left',
    format: (value: string) => categoryLabel(value),
  },
  { name: 'priority', label: 'Prioridad', field: 'priority', align: 'center' },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'reportedAt', label: 'Reportado', field: 'reportedAt', align: 'left' },
];

const onRequest: QTableProps['onRequest'] = ({ pagination: next }) => {
  setPagination(next.page ?? 1, next.rowsPerPage ?? 15);
};

const openTicket = (_event: Event, ticket: Ticket) => {
  void router.push({ name: TicketRoutes.DETAIL, params: { term: ticket.code } });
};
</script>

<template>
  <q-table
    :rows="tickets"
    :columns="columns"
    row-key="id"
    :loading="isFetching"
    :pagination="pagination"
    :rows-per-page-options="[15, 30, 50]"
    flat
    bordered
    binary-state-sort
    no-data-label="No hay tickets con esos filtros"
    rows-per-page-label="Filas por página"
    class="cursor-pointer"
    @request="onRequest"
    @row-click="openTicket"
  >
    <template #body-cell-code="{ value }">
      <q-td class="text-weight-medium text-primary">{{ value }}</q-td>
    </template>
    <template #body-cell-title="{ value }">
      <q-td style="max-width: 260px" class="ellipsis">
        {{ value }}
        <q-tooltip>{{ value }}</q-tooltip>
      </q-td>
    </template>
    <template #body-cell-priority="{ row }">
      <q-td class="text-center"><TicketPriorityBadge :priority="row.priority" /></q-td>
    </template>
    <template #body-cell-status="{ row }">
      <q-td class="text-center"><TicketStatusBadge :status="row.status" /></q-td>
    </template>
    <template #body-cell-reportedAt="{ value }">
      <q-td>
        {{ formatDateTime(value) }}
        <div class="text-caption text-grey-7">{{ fromNow(value) }}</div>
      </q-td>
    </template>
  </q-table>
</template>
