<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import useDates from 'src/modules/shared/composables/useDates';
import { useTicketsManageStore } from 'src/modules/tickets/composables/useTicketsManageStore';
import { TicketRoutes } from 'src/modules/tickets/interfaces/ticket-routes';
import type { TicketFilters } from 'src/modules/tickets/interfaces/ticket';
import DashboardFilters from '../components/DashboardFilters.vue';
import KpiCard from '../components/KpiCard.vue';
import BarListCard from '../components/BarListCard.vue';
import WeeklyTrendChart from '../components/WeeklyTrendChart.vue';
import { useMetricsQuery } from '../composables/useMetricsQuery';
import { useDashboardManageStore } from '../composables/useDashboardManageStore';
import type { CountByKey } from '../interfaces/metrics';

const router = useRouter();
const { formatHours } = useDates();
const { metrics, isFetching } = useMetricsQuery();
const { filters: dashboardFilters } = useDashboardManageStore();
const { resetFilters, setFilters } = useTicketsManageStore();

const kpis = computed(() => {
  const totals = metrics.value?.totals;
  const times = metrics.value?.times;
  if (!totals || !times) return [];
  return [
    { label: 'Tickets', value: totals.total, icon: 'sym_r_confirmation_number' },
    { label: 'Abiertos', value: totals.open, icon: 'sym_r_pending_actions' },
    {
      label: 'Resueltos',
      value: totals.resolved,
      icon: 'sym_r_task_alt',
      caption: `${totals.resolutionRate}% de resolución`,
    },
    { label: 'Escalados a desarrollo', value: totals.escalatedToDev, icon: 'sym_r_code' },
    {
      label: 'Primera respuesta promedio',
      value: formatHours(times.avgFirstResponseHours),
      icon: 'sym_r_timer',
    },
    {
      label: 'Resolución promedio',
      value: formatHours(times.avgResolutionHours),
      icon: 'sym_r_schedule',
      caption: `Mediana ${formatHours(times.medianResolutionHours)}`,
    },
  ];
});

const openFilteredTickets = (partial: Partial<TicketFilters>) => {
  resetFilters();
  setFilters({ company: dashboardFilters.value.company, ...partial });
  void router.push({ name: TicketRoutes.LIST });
};

const hasKey = (item: CountByKey) => item.key !== 'NONE';

const selectStatus = (item: CountByKey) =>
  openFilteredTickets({ status: [item.key as TicketFilters['status'][number]] });
const selectCategory = (item: CountByKey) =>
  openFilteredTickets({ category: item.key as TicketFilters['category'] });
const selectCompany = (item: CountByKey) =>
  openFilteredTickets({ company: item.key as TicketFilters['company'] });
const selectPriority = (item: CountByKey) =>
  openFilteredTickets({ priority: item.key as TicketFilters['priority'] });
const selectRootCause = (item: CountByKey) =>
  hasKey(item) && openFilteredTickets({ rootCause: item.key as TicketFilters['rootCause'] });
const selectAssignee = (item: CountByKey) =>
  hasKey(item) && openFilteredTickets({ assigneeId: Number(item.key) });
const selectAging = () => openFilteredTickets({ onlyOpen: true });

const topProducts = computed<CountByKey[]>(() =>
  (metrics.value?.topProducts ?? []).map((item) => ({
    key: item.productCode,
    label: item.productCode,
    count: item.count,
  })),
);
const selectProduct = (item: CountByKey) => openFilteredTickets({ search: item.key });
</script>

<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="page-title col">Métricas de soporte</div>
      <q-spinner v-if="isFetching" color="primary" size="20px" />
    </div>

    <DashboardFilters />

    <template v-if="metrics">
      <div class="row q-col-gutter-md q-mb-md">
        <div v-for="kpi in kpis" :key="kpi.label" class="col-6 col-md-4 col-lg-2">
          <KpiCard v-bind="kpi" />
        </div>
      </div>

      <div class="q-mb-md">
        <WeeklyTrendChart :items="metrics.weeklyTrend" />
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard title="Por estado" :items="metrics.byStatus" @select="selectStatus" />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard
            title="Antigüedad de abiertos"
            :items="metrics.backlogAging"
            @select="selectAging"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard title="Por sede" :items="metrics.byCompany" @select="selectCompany" />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard
            title="Por categoría"
            :items="metrics.byCategory"
            @select="selectCategory"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard
            title="Por causa raíz"
            :items="metrics.byRootCause"
            @select="selectRootCause"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard
            title="Por prioridad"
            :items="metrics.byPriority"
            @select="selectPriority"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard
            title="Por responsable"
            :items="metrics.byAssignee"
            @select="selectAssignee"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard
            title="Productos más reportados"
            :items="topProducts"
            empty-text="Sin productos registrados"
            @select="selectProduct"
          />
        </div>
      </div>
    </template>
  </q-page>
</template>
