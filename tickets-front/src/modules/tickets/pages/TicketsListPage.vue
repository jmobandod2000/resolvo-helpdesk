<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import TicketsFilters from '../components/TicketsFilters.vue';
import TicketsTable from '../components/TicketsTable.vue';
import { TicketRoutes } from '../interfaces/ticket-routes';

const { t } = useI18n();
</script>

<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="page-title col">{{ t('tickets.title') }}</div>
      <q-btn
        color="primary"
        unelevated
        icon="sym_r_add"
        :label="t('tickets.newTicket')"
        :to="{ name: TicketRoutes.CREATE }"
      />
    </div>
    <TicketsFilters />
    <TicketsTable />
  </q-page>
</template>
