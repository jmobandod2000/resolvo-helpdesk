<script setup lang="ts">
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import useDates from 'src/modules/shared/composables/useDates';
import KpiCard from 'src/modules/dashboard/components/KpiCard.vue';
import WeeklyTrendChart from 'src/modules/dashboard/components/WeeklyTrendChart.vue';
import { useUsersQuery } from 'src/modules/users/composables/useUsersQuery';
import { usePublicProfile } from 'src/modules/organization/composables/useOrganization';
import { TicketRoutes } from 'src/modules/tickets/interfaces/ticket-routes';
import ReportFilters from '../components/ReportFilters.vue';
import ReportTable from '../components/ReportTable.vue';
import useReportColumns from '../composables/useReportColumns';
import useReportExport from '../composables/useReportExport';
import { useReportQuery } from '../composables/useReportQuery';
import { useReportsManageStore } from '../composables/useReportsManageStore';
import type {
  ReportBacklogItem,
  ReportBreakdown,
  ReportDimensionRow,
  ReportTicketItem,
} from '../interfaces/report';

type ReportTab = 'periods' | 'assignees' | 'breakdown' | 'backlog' | 'detail';

const IDLE_DAYS_WARNING = 7;
const BREAKDOWNS: ReportBreakdown[] = ['site', 'category', 'priority', 'rootCause', 'requester'];
const HELP_KEYS = ['received', 'resolved', 'rate', 'backlog', 'times', 'actions'];

const router = useRouter();
const { t } = useI18n();
const { formatDate, formatDateTime, formatHours, formatNumber } = useDates();
const { userOptions } = useUsersQuery();
const { organizationName } = usePublicProfile();
const { filters } = useReportsManageStore();
const { report, isFetching, isError, isRangeValid } = useReportQuery();
const columns = useReportColumns();
const { exportExcel, isExporting } = useReportExport();

const tab = ref<ReportTab>('periods');
const breakdown = ref<ReportBreakdown>('site');

const groupBy = computed(() => report.value?.range.groupBy ?? filters.value.groupBy);

const kpis = computed(() => {
  const totals = report.value?.totals;
  if (!totals) return [];
  return [
    { label: t('reports.kpi.received'), value: formatNumber(totals.received), icon: 'sym_r_inbox' },
    { label: t('reports.kpi.resolved'), value: formatNumber(totals.resolved), icon: 'sym_r_task_alt' },
    { label: t('reports.kpi.closed'), value: formatNumber(totals.closed), icon: 'sym_r_lock' },
    {
      label: t('reports.kpi.resolutionRate'),
      value: `${formatNumber(totals.resolutionRate)}%`,
      icon: 'sym_r_percent',
      caption: t('reports.kpi.resolutionRateCaption'),
    },
    {
      label: t('reports.kpi.openNow'),
      value: formatNumber(totals.openNow),
      icon: 'sym_r_pending_actions',
    },
    {
      label: t('reports.kpi.escalated'),
      value: formatNumber(totals.escalated),
      icon: 'sym_r_code',
    },
    {
      label: t('reports.kpi.firstResponse'),
      value: formatHours(totals.avgFirstResponseHours),
      icon: 'sym_r_timer',
    },
    {
      label: t('reports.kpi.resolution'),
      value: formatHours(totals.avgResolutionHours),
      icon: 'sym_r_schedule',
      caption: t('reports.kpi.median', { value: formatHours(totals.medianResolutionHours) }),
    },
  ];
});

const periodColumns = computed(() => columns.periodColumns(groupBy.value));

const chartItems = computed(() =>
  (report.value?.periods ?? []).map((period) => ({
    week: period.periodFrom,
    created: period.received,
    resolved: period.resolved,
  })),
);

const periodTooltip = (periodFrom: string) => {
  const period = report.value?.periods.find((item) => item.periodFrom === periodFrom);
  return period ? String(periodColumns.value[0]!.value(period)) : periodFrom;
};

const chartLabel = (periodFrom: string) =>
  dayjs(periodFrom).format(groupBy.value === 'month' ? 'MMM YY' : 'DD/MM');

const breakdownRows = computed<ReportDimensionRow[]>(() => {
  if (!report.value) return [];
  const sources: Record<ReportBreakdown, ReportDimensionRow[]> = {
    site: report.value.bySite,
    category: report.value.byCategory,
    priority: report.value.byPriority,
    rootCause: report.value.byRootCause,
    requester: report.value.byRequester,
  };
  return sources[breakdown.value];
});

const breakdownOptions = computed(() =>
  BREAKDOWNS.map((value) => ({ value, label: t(`reports.breakdown.${value}`) })),
);

const rangeLabel = computed(() =>
  t('reports.rangeLabel', { from: formatDate(filters.value.from), to: formatDate(filters.value.to) }),
);

const assigneeName = computed(
  () => userOptions.value.find((option) => option.value === filters.value.assigneeId)?.label ?? null,
);

const isIdle = (row: ReportBacklogItem) => row.idleDays > IDLE_DAYS_WARNING;

const openTicket = (row: ReportBacklogItem | ReportTicketItem) => {
  void router.push({ name: TicketRoutes.DETAIL, params: { term: row.code ?? String(row.id) } });
};

const download = () => {
  if (report.value) void exportExcel(report.value, filters.value, assigneeName.value);
};

const print = () => window.print();
</script>

<template>
  <q-page padding>
    <div class="row items-center q-mb-md q-col-gutter-sm">
      <div class="col-12 col-md">
        <div class="page-title">
          {{ t('reports.title') }}
          <span v-if="organizationName" class="text-grey-7 text-weight-regular">
            · {{ organizationName }}
          </span>
        </div>
        <div class="text-caption text-grey-7">
          {{ t('reports.subtitle') }} · {{ rangeLabel }}
          <span v-if="report" class="print-only">
            · {{ t('reports.generatedAt', { date: formatDateTime(report.range.generatedAt) }) }}
          </span>
        </div>
      </div>
      <div class="col-12 col-md-auto row q-gutter-sm justify-end print-hide">
        <q-btn
          unelevated
          no-caps
          color="positive"
          icon="sym_r_download"
          :label="t('reports.download')"
          :loading="isExporting"
          :disable="!report || isFetching"
          @click="download"
        />
        <q-btn
          outline
          no-caps
          color="primary"
          icon="sym_r_print"
          :label="t('reports.print')"
          :disable="!report"
          @click="print"
        />
      </div>
    </div>

    <ReportFilters />

    <q-linear-progress v-if="isFetching" indeterminate color="primary" class="q-mb-sm" />

    <q-banner v-if="!isRangeValid" rounded class="bg-orange-1 text-orange-10 q-mb-md">
      <template #avatar><q-icon name="sym_r_warning" /></template>
      {{ t('reports.invalidRange') }}
    </q-banner>
    <q-banner v-else-if="isError" rounded class="bg-red-1 text-negative q-mb-md">
      <template #avatar><q-icon name="sym_r_error" /></template>
      {{ t('errors.timeout.reports') }}
    </q-banner>

    <template v-if="report && isRangeValid">
      <div class="row q-col-gutter-md q-mb-md">
        <div v-for="kpi in kpis" :key="kpi.label" class="col-6 col-sm-4 col-md-3">
          <KpiCard v-bind="kpi" />
        </div>
      </div>

      <q-expansion-item
        dense
        icon="sym_r_help"
        :label="t('reports.help.title')"
        header-class="text-grey-8"
        class="q-mb-md print-hide"
      >
        <q-card flat bordered>
          <q-card-section class="q-py-sm">
            <ul class="q-my-none q-pl-md text-body2 text-grey-8">
              <li v-for="key in HELP_KEYS" :key="key">{{ t(`reports.help.${key}`) }}</li>
            </ul>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-card flat bordered>
        <q-tabs
          v-model="tab"
          dense
          no-caps
          align="left"
          active-color="primary"
          indicator-color="primary"
          class="text-grey-8 print-hide"
          outside-arrows
          mobile-arrows
        >
          <q-tab name="periods" icon="sym_r_calendar_month" :label="t('reports.tabs.periods')" />
          <q-tab name="assignees" icon="sym_r_support_agent" :label="t('reports.tabs.assignees')" />
          <q-tab name="breakdown" icon="sym_r_pie_chart" :label="t('reports.tabs.breakdown')" />
          <q-tab name="backlog" icon="sym_r_pending_actions" :label="t('reports.tabs.backlog')">
            <q-badge v-if="report.backlog.length" color="orange-8" floating>
              {{ report.backlog.length }}
            </q-badge>
          </q-tab>
          <q-tab name="detail" icon="sym_r_list_alt" :label="t('reports.tabs.detail')" />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="tab" animated keep-alive>
          <q-tab-panel name="periods" class="q-gutter-md">
            <WeeklyTrendChart
              :items="chartItems"
              :title="t('reports.chartTitle')"
              :format-label="chartLabel"
              :format-tooltip="periodTooltip"
              :period-header="t('reports.columns.period')"
            />
            <ReportTable row-key="period" :rows="report.periods" :columns="periodColumns" />
          </q-tab-panel>

          <q-tab-panel name="assignees">
            <ReportTable
              row-key="key"
              :rows="report.byAssignee"
              :columns="columns.assigneeColumns()"
            />
          </q-tab-panel>

          <q-tab-panel name="breakdown" class="q-gutter-md">
            <q-btn-toggle
              v-model="breakdown"
              :options="breakdownOptions"
              no-caps
              unelevated
              toggle-color="primary"
              color="grey-2"
              text-color="grey-9"
              class="print-hide"
            />
            <ReportTable
              row-key="key"
              :rows="breakdownRows"
              :columns="columns.breakdownColumns(breakdown)"
            />
          </q-tab-panel>

          <q-tab-panel name="backlog" class="q-gutter-sm">
            <div class="text-caption text-grey-7 row items-center q-gutter-xs">
              <span class="idle-swatch" />
              <span>{{ t('reports.idleHint', { n: IDLE_DAYS_WARNING }) }}</span>
            </div>
            <ReportTable
              row-key="id"
              :rows="report.backlog"
              :columns="columns.backlogColumns()"
              :highlight="isIdle"
              clickable
              @row-click="openTicket"
            />
          </q-tab-panel>

          <q-tab-panel name="detail" class="q-gutter-sm">
            <q-banner v-if="report.ticketsTruncated" dense rounded class="bg-orange-1 text-orange-10">
              {{ t('reports.truncated', { n: report.tickets.length }) }}
            </q-banner>
            <ReportTable
              row-key="id"
              :rows="report.tickets"
              :columns="columns.detailColumns()"
              searchable
              paginated
              clickable
              @row-click="openTicket"
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </template>
  </q-page>
</template>

<style scoped>
.idle-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: #fff3e0;
  border: 1px solid #ffb74d;
}
</style>
