<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import useDates from 'src/modules/shared/composables/useDates';
import useCatalogs from 'src/modules/shared/composables/useCatalogs';
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
const { t, te } = useI18n();
const { formatHours, formatNumber } = useDates();
const { statusLabel, priorityLabel, rootCauseLabel } = useCatalogs();
const { metrics, isFetching } = useMetricsQuery();
const { filters: dashboardFilters } = useDashboardManageStore();
const { resetFilters, setFilters } = useTicketsManageStore();

const kpis = computed(() => {
  const totals = metrics.value?.totals;
  const times = metrics.value?.times;
  if (!totals || !times) return [];
  return [
    { label: t('dashboard.kpi.tickets'), value: totals.total, icon: 'sym_r_confirmation_number' },
    { label: t('dashboard.kpi.open'), value: totals.open, icon: 'sym_r_pending_actions' },
    {
      label: t('dashboard.kpi.resolved'),
      value: totals.resolved,
      icon: 'sym_r_task_alt',
      caption: t('dashboard.kpi.resolutionRate', { rate: formatNumber(totals.resolutionRate) }),
    },
    { label: t('dashboard.kpi.escalated'), value: totals.escalatedToDev, icon: 'sym_r_code' },
    {
      label: t('dashboard.kpi.firstResponse'),
      value: formatHours(times.avgFirstResponseHours),
      icon: 'sym_r_timer',
    },
    {
      label: t('dashboard.kpi.resolution'),
      value: formatHours(times.avgResolutionHours),
      icon: 'sym_r_schedule',
      caption: t('dashboard.kpi.median', { value: formatHours(times.medianResolutionHours) }),
    },
  ];
});

const relabel = (items: CountByKey[] | undefined, labelOf: (key: string) => string) =>
  (items ?? []).map((item) => ({ ...item, label: item.key === 'NONE' ? t('enums.notDefined') : labelOf(item.key) }));

const byStatus = computed(() => relabel(metrics.value?.byStatus, statusLabel));
const bySite = computed(() =>
  (metrics.value?.bySite ?? []).map((item) => ({
    ...item,
    label: item.key === 'NONE' ? t('sites.general') : item.label,
  })),
);
const byCategory = computed(() =>
  (metrics.value?.byCategory ?? []).map((item) => ({
    ...item,
    label: item.key === 'NONE' ? t('categories.none') : item.label,
  })),
);
const byPriority = computed(() => relabel(metrics.value?.byPriority, priorityLabel));
const byRootCause = computed(() => relabel(metrics.value?.byRootCause, rootCauseLabel));
const backlogAging = computed(() =>
  relabel(metrics.value?.backlogAging, (key) =>
    te(`enums.aging.${key}`) ? t(`enums.aging.${key}`) : key,
  ),
);
const byAssignee = computed(() =>
  (metrics.value?.byAssignee ?? []).map((item) => ({
    ...item,
    label: item.key === 'NONE' ? t('enums.unassigned') : item.label,
  })),
);

const openFilteredTickets = (partial: Partial<TicketFilters>) => {
  resetFilters();
  setFilters({ siteId: dashboardFilters.value.siteId, ...partial });
  void router.push({ name: TicketRoutes.LIST });
};

const hasKey = (item: CountByKey) => item.key !== 'NONE';

const selectStatus = (item: CountByKey) =>
  openFilteredTickets({ status: [item.key as TicketFilters['status'][number]] });
const selectCategory = (item: CountByKey) =>
  hasKey(item) && openFilteredTickets({ categoryId: Number(item.key) });
const selectSite = (item: CountByKey) =>
  hasKey(item) && openFilteredTickets({ siteId: Number(item.key) });
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
      <div class="page-title col">{{ t('dashboard.title') }}</div>
      <q-spinner v-if="isFetching" color="primary" size="20px" />
    </div>

    <DashboardFilters />

    <template v-if="metrics">
      <div class="row q-col-gutter-md q-mb-md">
        <div v-for="kpi in kpis" :key="kpi.icon" class="col-6 col-md-4 col-lg-2">
          <KpiCard v-bind="kpi" />
        </div>
      </div>

      <div class="q-mb-md">
        <WeeklyTrendChart :items="metrics.weeklyTrend" />
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard :title="t('dashboard.cards.byStatus')" :items="byStatus" @select="selectStatus" />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard :title="t('dashboard.cards.aging')" :items="backlogAging" @select="selectAging" />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard
            :title="t('dashboard.cards.bySite')"
            :items="bySite"
            @select="selectSite"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard
            :title="t('dashboard.cards.byCategory')"
            :items="byCategory"
            @select="selectCategory"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard
            :title="t('dashboard.cards.byRootCause')"
            :items="byRootCause"
            @select="selectRootCause"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard
            :title="t('dashboard.cards.byPriority')"
            :items="byPriority"
            @select="selectPriority"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard
            :title="t('dashboard.cards.byAssignee')"
            :items="byAssignee"
            @select="selectAssignee"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <BarListCard
            :title="t('dashboard.cards.topProducts')"
            :items="topProducts"
            :empty-text="t('dashboard.cards.noProducts')"
            @select="selectProduct"
          />
        </div>
      </div>
    </template>
  </q-page>
</template>
