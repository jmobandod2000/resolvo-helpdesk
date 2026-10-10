<script setup lang="ts">
import TicketsFilters from '../components/TicketsFilters.vue';
import TicketsTable from '../components/TicketsTable.vue';
import { TicketRoutes } from '../interfaces/ticket-routes';
</script>

<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="page-title col">Tickets</div>
      <q-btn
        color="primary"
        unelevated
        icon="sym_r_add"
        label="Nuevo ticket"
        :to="{ name: TicketRoutes.CREATE }"
      />
    </div>
    <TicketsFilters />
    <TicketsTable />
  </q-page>
</template>
