<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import { useSites } from 'src/modules/organization/composables/useSites';
import { useCategories } from 'src/modules/organization/composables/useCategories';
import useDates from 'src/modules/shared/composables/useDates';
import TicketPriorityBadge from './TicketPriorityBadge.vue';
import type { Ticket } from '../interfaces/ticket';

const props = defineProps<{ ticket: Ticket }>();

const { t } = useI18n();
const { channelLabel, rootCauseLabel } = useCatalogs();
const { categoryLabel } = useCategories();
const { siteLabel } = useSites();
const { formatDateTime, formatHours, formatNumber } = useDates();

const hoursBetween = (start: string, end: string | null) =>
  end ? Math.round(((Date.parse(end) - Date.parse(start)) / 3_600_000) * 10) / 10 : null;

const rows = computed(() => [
  { key: 'site', label: t('tickets.fields.site'), value: siteLabel(props.ticket.Site) },
  { key: 'category', label: t('tickets.fields.category'), value: categoryLabel(props.ticket.Category) },
  { key: 'channel', label: t('tickets.fields.channel'), value: channelLabel(props.ticket.channel) },
  {
    key: 'requester',
    label: t('tickets.fields.requester'),
    value: [props.ticket.requesterName, props.ticket.requesterArea].filter(Boolean).join(' · '),
  },
  {
    key: 'assignee',
    label: t('tickets.fields.assignee'),
    value: props.ticket.Assignee?.name ?? t('enums.unassigned'),
  },
  { key: 'reported', label: t('tickets.fields.reported'), value: formatDateTime(props.ticket.reportedAt) },
  {
    key: 'firstResponse',
    label: t('tickets.info.firstResponse'),
    value: formatHours(hoursBetween(props.ticket.reportedAt, props.ticket.firstResponseAt)),
  },
  {
    key: 'resolutionTime',
    label: t('tickets.info.resolutionTime'),
    value: formatHours(hoursBetween(props.ticket.reportedAt, props.ticket.resolvedAt)),
  },
  { key: 'closed', label: t('tickets.info.closed'), value: formatDateTime(props.ticket.closedAt) },
  {
    key: 'rootCause',
    label: t('tickets.fields.rootCause'),
    value: rootCauseLabel(props.ticket.rootCause),
  },
  {
    key: 'affectedUnits',
    label: t('tickets.fields.affectedUnits'),
    value: formatNumber(props.ticket.affectedUnits),
  },
]);
</script>

<template>
  <q-card flat bordered>
    <q-card-section class="row items-center">
      <div class="section-title col">{{ t('tickets.sections.details') }}</div>
      <TicketPriorityBadge :priority="ticket.priority" />
    </q-card-section>
    <q-separator />
    <q-list dense>
      <q-item v-for="row in rows" :key="row.key">
        <q-item-section class="text-grey-7">{{ row.label }}</q-item-section>
        <q-item-section side class="text-right text-dark">{{ row.value }}</q-item-section>
      </q-item>
    </q-list>
    <template v-if="ticket.productCodes.length || ticket.documents.length">
      <q-separator />
      <q-card-section class="q-gutter-xs">
        <div v-if="ticket.productCodes.length" class="text-caption text-grey-7">
          {{ t('tickets.sections.products') }}
        </div>
        <q-chip v-for="code in ticket.productCodes" :key="code" dense square icon="sym_r_inventory_2">
          {{ code }}
        </q-chip>
        <div v-if="ticket.documents.length" class="text-caption text-grey-7">
          {{ t('tickets.sections.documents') }}
        </div>
        <q-chip v-for="doc in ticket.documents" :key="doc" dense square icon="sym_r_description">
          {{ doc }}
        </q-chip>
      </q-card-section>
    </template>
  </q-card>
</template>
