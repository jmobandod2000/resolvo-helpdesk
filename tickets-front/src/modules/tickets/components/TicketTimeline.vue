<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import useDates from 'src/modules/shared/composables/useDates';
import { STATUS_COLORS } from '../helpers/ticketColors';
import type { TicketEvent, TicketEventType } from '../interfaces/ticket';

defineProps<{ events: TicketEvent[] }>();

const { t } = useI18n();
const { statusLabel } = useCatalogs();
const { formatDateTime } = useDates();

const EVENT_ICONS: Record<TicketEventType, string> = {
  CREATED: 'sym_r_add_circle',
  STATUS_CHANGED: 'sym_r_swap_horiz',
  NOTE: 'sym_r_chat',
  ASSIGNED: 'sym_r_person',
  UPDATED: 'sym_r_edit',
};

const EVENT_TITLE_KEYS: Record<Exclude<TicketEventType, 'STATUS_CHANGED'>, string> = {
  CREATED: 'tickets.timeline.created',
  NOTE: 'tickets.timeline.note',
  ASSIGNED: 'tickets.timeline.assigned',
  UPDATED: 'tickets.timeline.updated',
};

const LEGACY_DEFAULT_NOTES = ['Ticket registrado', 'Datos del ticket actualizados'];
const LEGACY_ASSIGNED_PREFIX = 'Asignado a ';

const assigneeName = (note: string | null) => {
  const name = note?.startsWith(LEGACY_ASSIGNED_PREFIX)
    ? note.slice(LEGACY_ASSIGNED_PREFIX.length)
    : note;
  return name && name !== 'nadie' ? name : t('enums.unassigned');
};

const buildTitle = (event: TicketEvent) => {
  if (event.type === 'STATUS_CHANGED')
    return `${statusLabel(event.fromStatus)} → ${statusLabel(event.toStatus)}`;
  if (event.type === 'NOTE' && event.authorName) return t('tickets.timeline.requesterReply');
  if (event.type === 'ASSIGNED')
    return t('tickets.timeline.assignedTo', { name: assigneeName(event.note) });
  return t(EVENT_TITLE_KEYS[event.type]);
};

const isNoteVisible = (event: TicketEvent) =>
  !!event.note &&
  event.type !== 'ASSIGNED' &&
  event.note !== buildTitle(event) &&
  !LEGACY_DEFAULT_NOTES.includes(event.note);

const authorOf = (event: TicketEvent) =>
  event.authorName ? t('tickets.timeline.viaPortal', { name: event.authorName }) : event.User.name;

const eventColor = (event: TicketEvent) =>
  event.toStatus ? STATUS_COLORS[event.toStatus] : 'grey-7';
</script>

<template>
  <q-timeline color="primary" layout="dense" class="q-px-sm">
    <q-timeline-entry
      v-for="event in events"
      :key="event.id"
      :title="buildTitle(event)"
      :subtitle="`${formatDateTime(event.createdAt)} · ${authorOf(event)}`"
      :icon="EVENT_ICONS[event.type]"
      :color="eventColor(event)"
    >
      <div v-if="isNoteVisible(event)" class="text-pre-line text-body2">
        {{ event.note }}
      </div>
      <q-badge
        v-if="event.type === 'NOTE'"
        outline
        class="q-mt-xs"
        :color="event.isPublic ? 'primary' : 'grey-7'"
        :label="event.isPublic ? t('tickets.note.publicBadge') : t('tickets.note.internalBadge')"
      />
    </q-timeline-entry>
  </q-timeline>
</template>
