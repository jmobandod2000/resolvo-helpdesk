<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { QTableColumn, QTableProps } from 'quasar';

import { useSites } from 'src/modules/organization/composables/useSites';
import { useCategories } from 'src/modules/organization/composables/useCategories';
import useDates from 'src/modules/shared/composables/useDates';
import TicketStatusBadge from './TicketStatusBadge.vue';
import TicketPriorityBadge from './TicketPriorityBadge.vue';
import { useTicketsQuery } from '../composables/useTicketsQuery';
import { useTicketsManageStore } from '../composables/useTicketsManageStore';
import type { Ticket } from '../interfaces/ticket';
import { TicketRoutes } from '../interfaces/ticket-routes';

const router = useRouter();
const { t } = useI18n();
const { categoryLabel } = useCategories();
const { siteLabel } = useSites();
const { formatDateTime, fromNow } = useDates();
const { tickets, total, isFetching } = useTicketsQuery();
const { page, rowsPerPage, setPagination } = useTicketsManageStore();

const pagination = computed(() => ({
  page: page.value,
  rowsPerPage: rowsPerPage.value,
  rowsNumber: total.value,
}));

const columns = computed<QTableColumn<Ticket>[]>(() => [
  { name: 'code', label: t('tickets.fields.code'), field: 'code', align: 'left' },
  { name: 'title', label: t('tickets.fields.title'), field: 'title', align: 'left' },
  {
    name: 'requesterName',
    label: t('tickets.fields.requester'),
    field: 'requesterName',
    align: 'left',
  },
  {
    name: 'site',
    label: t('tickets.fields.site'),
    field: (ticket: Ticket) => siteLabel(ticket.Site),
    align: 'left',
  },
  {
    name: 'category',
    label: t('tickets.fields.category'),
    field: (ticket: Ticket) => categoryLabel(ticket.Category),
    align: 'left',
  },
  { name: 'priority', label: t('tickets.fields.priority'), field: 'priority', align: 'center' },
  { name: 'status', label: t('tickets.fields.status'), field: 'status', align: 'center' },
  { name: 'reportedAt', label: t('tickets.fields.reported'), field: 'reportedAt', align: 'left' },
]);

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
    :no-data-label="t('tickets.empty.table')"
    :rows-per-page-label="t('common.rowsPerPage')"
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
