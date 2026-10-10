<script setup lang="ts">
import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import useDates from 'src/modules/shared/composables/useDates';
import { STATUS_COLORS } from '../helpers/ticketColors';
import type { TicketEvent, TicketEventType } from '../interfaces/ticket';

defineProps<{ events: TicketEvent[] }>();

const { statusLabel } = useCatalogs();
const { formatDateTime } = useDates();

const EVENT_ICONS: Record<TicketEventType, string> = {
  CREATED: 'sym_r_add_circle',
  STATUS_CHANGED: 'sym_r_swap_horiz',
  NOTE: 'sym_r_chat',
  ASSIGNED: 'sym_r_person',
  UPDATED: 'sym_r_edit',
};

const buildTitle = (event: TicketEvent) => {
  if (event.type === 'STATUS_CHANGED')
    return `${statusLabel(event.fromStatus)} → ${statusLabel(event.toStatus)}`;
  if (event.type === 'CREATED') return 'Ticket registrado';
  if (event.type === 'NOTE') return 'Nota de seguimiento';
  if (event.type === 'ASSIGNED') return 'Reasignación';
  return 'Actualización';
};

const eventColor = (event: TicketEvent) =>
  event.toStatus ? STATUS_COLORS[event.toStatus] : 'grey-7';
</script>

<template>
  <q-timeline color="primary" layout="dense" class="q-px-sm">
    <q-timeline-entry
      v-for="event in events"
      :key="event.id"
      :title="buildTitle(event)"
      :subtitle="`${formatDateTime(event.createdAt)} · ${event.User.name}`"
      :icon="EVENT_ICONS[event.type]"
      :color="eventColor(event)"
    >
      <div v-if="event.note && event.note !== buildTitle(event)" class="text-pre-line text-body2">
        {{ event.note }}
      </div>
    </q-timeline-entry>
  </q-timeline>
</template>
