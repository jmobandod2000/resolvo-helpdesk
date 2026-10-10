<script setup lang="ts">
import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import { PRIORITY_COLORS } from '../helpers/ticketColors';
import type { TicketPriority } from '../interfaces/ticket';

defineProps<{ priority: TicketPriority }>();

const { priorityLabel } = useCatalogs();
</script>

<template>
  <q-badge outline :color="PRIORITY_COLORS[priority]" :label="priorityLabel(priority)" />
</template>
