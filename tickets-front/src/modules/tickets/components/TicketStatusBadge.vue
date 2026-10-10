<script setup lang="ts">
import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import { STATUS_COLORS } from '../helpers/ticketColors';
import type { TicketStatus } from '../interfaces/ticket';

defineProps<{ status: TicketStatus }>();

const { statusLabel } = useCatalogs();
</script>

<template>
  <q-badge :color="STATUS_COLORS[status]" class="q-py-xs q-px-sm" :label="statusLabel(status)" />
</template>
