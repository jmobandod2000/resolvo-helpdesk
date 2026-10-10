<script setup lang="ts">
import { computed } from 'vue';

import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import useDates from 'src/modules/shared/composables/useDates';
import TicketPriorityBadge from './TicketPriorityBadge.vue';
import type { Ticket } from '../interfaces/ticket';

const props = defineProps<{ ticket: Ticket }>();

const { companyLabel, categoryLabel, channelLabel, rootCauseLabel } = useCatalogs();
const { formatDateTime, formatHours } = useDates();

const hoursBetween = (start: string, end: string | null) =>
  end ? Math.round(((Date.parse(end) - Date.parse(start)) / 3_600_000) * 10) / 10 : null;

const rows = computed(() => [
  { label: 'Sede', value: companyLabel(props.ticket.company) },
  { label: 'Categoría', value: categoryLabel(props.ticket.category) },
  { label: 'Canal', value: channelLabel(props.ticket.channel) },
  {
    label: 'Solicitante',
    value: [props.ticket.requesterName, props.ticket.requesterArea].filter(Boolean).join(' · '),
  },
  { label: 'Asignado a', value: props.ticket.Assignee?.name ?? 'Sin asignar' },
  { label: 'Reportado', value: formatDateTime(props.ticket.reportedAt) },
  {
    label: 'Primera respuesta',
    value: formatHours(hoursBetween(props.ticket.reportedAt, props.ticket.firstResponseAt)),
  },
  {
    label: 'Tiempo de resolución',
    value: formatHours(hoursBetween(props.ticket.reportedAt, props.ticket.resolvedAt)),
  },
  { label: 'Cerrado', value: formatDateTime(props.ticket.closedAt) },
  { label: 'Causa raíz', value: props.ticket.rootCause ? rootCauseLabel(props.ticket.rootCause) : '—' },
  {
    label: 'Unidades involucradas',
    value: props.ticket.affectedUnits?.toLocaleString('es-VE') ?? '—',
  },
]);
</script>

<template>
  <q-card flat bordered>
    <q-card-section class="row items-center">
      <div class="section-title col">Datos del ticket</div>
      <TicketPriorityBadge :priority="ticket.priority" />
    </q-card-section>
    <q-separator />
    <q-list dense>
      <q-item v-for="row in rows" :key="row.label">
        <q-item-section class="text-grey-7">{{ row.label }}</q-item-section>
        <q-item-section side class="text-right text-dark">{{ row.value }}</q-item-section>
      </q-item>
    </q-list>
    <template v-if="ticket.productCodes.length || ticket.documents.length">
      <q-separator />
      <q-card-section class="q-gutter-xs">
        <div v-if="ticket.productCodes.length" class="text-caption text-grey-7">Productos</div>
        <q-chip v-for="code in ticket.productCodes" :key="code" dense square icon="sym_r_inventory_2">
          {{ code }}
        </q-chip>
        <div v-if="ticket.documents.length" class="text-caption text-grey-7">Documentos</div>
        <q-chip v-for="doc in ticket.documents" :key="doc" dense square icon="sym_r_description">
          {{ doc }}
        </q-chip>
      </q-card-section>
    </template>
  </q-card>
</template>
