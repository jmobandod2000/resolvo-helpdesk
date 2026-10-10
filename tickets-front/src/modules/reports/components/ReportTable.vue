<script setup lang="ts" generic="Row">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import useReportColumns from '../composables/useReportColumns';
import type { ReportColumn } from '../composables/useReportColumns';

interface Props {
  rows: Row[];
  columns: ReportColumn<Row>[];
  rowKey: string;
  searchable?: boolean;
  paginated?: boolean;
  clickable?: boolean;
  highlight?: (row: Row) => boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ rowClick: [row: Row] }>();

const { t } = useI18n();
const { toTableColumns, display } = useReportColumns();
const search = ref('');

const tableColumns = computed(() => toTableColumns(props.columns));

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return props.rows;
  return props.rows.filter((row) =>
    props.columns.some((column) =>
      display(column.kind, column.value(row)).toLowerCase().includes(term),
    ),
  );
});

const pagination = ref({ rowsPerPage: props.paginated ? 25 : 0 });

const rowClass = (row: Row) => (props.highlight?.(row) ? 'bg-orange-1' : '');
</script>

<template>
  <q-table
    flat
    bordered
    dense
    :rows="filteredRows"
    :columns="tableColumns"
    :row-key="rowKey"
    :rows-per-page-options="paginated ? [25, 50, 100, 0] : [0]"
    v-model:pagination="pagination"
    :hide-pagination="!paginated"
    :table-row-class-fn="rowClass"
    :class="{ 'cursor-pointer': clickable }"
    :no-data-label="t('reports.empty')"
    @row-click="(_event: Event, row: Row) => clickable && emit('rowClick', row)"
  >
    <template v-if="searchable" #top-right>
      <q-input
        v-model="search"
        dense
        outlined
        clearable
        debounce="250"
        :placeholder="t('reports.searchDetail')"
        class="print-hide"
      >
        <template #prepend><q-icon name="sym_r_search" /></template>
      </q-input>
    </template>
  </q-table>
</template>
