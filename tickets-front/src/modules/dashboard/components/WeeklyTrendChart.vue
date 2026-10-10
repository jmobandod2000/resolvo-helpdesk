<script setup lang="ts">
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import type { WeeklyTrendItem } from '../interfaces/metrics';

const props = defineProps<{ items: WeeklyTrendItem[] }>();

const SERIES = [
  { key: 'created', label: 'Recibidos', color: '#2a78d6' },
  { key: 'resolved', label: 'Resueltos', color: '#eb6834' },
] as const;

const CHART_HEIGHT = 200;
const PADDING = { top: 12, right: 8, bottom: 28, left: 32 };
const BAR_WIDTH = 12;
const BAR_GAP = 2;

const hoveredIndex = ref<number | null>(null);
const isTableVisible = ref(false);

const maxValue = computed(() =>
  Math.max(1, ...props.items.flatMap((item) => [item.created, item.resolved])),
);

const yTicks = computed(() => {
  const step = Math.max(1, Math.ceil(maxValue.value / 4));
  return Array.from({ length: 5 }, (_, index) => index * step).filter(
    (tick) => tick <= step * 4,
  );
});

const yMax = computed(() => yTicks.value[yTicks.value.length - 1] || 1);
const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
const groupWidth = BAR_WIDTH * 2 + BAR_GAP;
const slotWidth = computed(() => groupWidth + 18);
const chartWidth = computed(
  () => PADDING.left + PADDING.right + props.items.length * slotWidth.value,
);

const yOf = (value: number) => PADDING.top + plotHeight - (value / yMax.value) * plotHeight;
const xOf = (index: number) => PADDING.left + index * slotWidth.value + 9;
const barPath = (x: number, value: number) => {
  const height = Math.max((value / yMax.value) * plotHeight, value > 0 ? 3 : 0);
  if (height === 0) return '';
  const y = PADDING.top + plotHeight - height;
  const radius = Math.min(4, height, BAR_WIDTH / 2);
  const bottom = PADDING.top + plotHeight;
  return `M${x},${bottom} V${y + radius} Q${x},${y} ${x + radius},${y} H${x + BAR_WIDTH - radius} Q${x + BAR_WIDTH},${y} ${x + BAR_WIDTH},${y + radius} V${bottom} Z`;
};

const weekLabel = (week: string) => dayjs(week).format('DD/MM');
const hoveredItem = computed(() =>
  hoveredIndex.value === null ? null : props.items[hoveredIndex.value],
);
const tooltipLeft = computed(() =>
  hoveredIndex.value === null ? 0 : xOf(hoveredIndex.value) + groupWidth / 2,
);
</script>

<template>
  <q-card flat bordered>
    <q-card-section class="row items-center q-pb-none">
      <div class="section-title col">Tickets por semana</div>
      <div class="row items-center q-gutter-md text-caption text-grey-8">
        <div v-for="series in SERIES" :key="series.key" class="row items-center no-wrap">
          <span class="legend-swatch" :style="{ background: series.color }" />
          {{ series.label }}
        </div>
        <q-btn
          flat
          dense
          size="sm"
          :icon="isTableVisible ? 'sym_r_bar_chart' : 'sym_r_table'"
          :label="isTableVisible ? 'Gráfico' : 'Tabla'"
          @click="isTableVisible = !isTableVisible"
        />
      </div>
    </q-card-section>

    <q-card-section v-if="!isTableVisible" class="chart-scroll">
      <div class="chart-wrap" :style="{ width: `${chartWidth}px` }">
        <svg :width="chartWidth" :height="CHART_HEIGHT" role="img" aria-label="Tickets por semana">
          <g v-for="tick in yTicks" :key="tick">
            <line
              :x1="PADDING.left"
              :x2="chartWidth - PADDING.right"
              :y1="yOf(tick)"
              :y2="yOf(tick)"
              stroke="#e6e8ec"
              stroke-width="1"
            />
            <text :x="PADDING.left - 6" :y="yOf(tick) + 4" text-anchor="end" class="axis-text">
              {{ tick }}
            </text>
          </g>

          <g
            v-for="(item, index) in items"
            :key="item.week"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          >
            <rect
              :x="xOf(index) - 6"
              :y="PADDING.top"
              :width="groupWidth + 12"
              :height="plotHeight"
              :fill="hoveredIndex === index ? '#f1f4f8' : 'transparent'"
            />
            <path :d="barPath(xOf(index), item.created)" :fill="SERIES[0].color" />
            <path
              :d="barPath(xOf(index) + BAR_WIDTH + BAR_GAP, item.resolved)"
              :fill="SERIES[1].color"
            />
            <text
              :x="xOf(index) + groupWidth / 2"
              :y="CHART_HEIGHT - 8"
              text-anchor="middle"
              class="axis-text"
            >
              {{ weekLabel(item.week) }}
            </text>
          </g>

          <line
            :x1="PADDING.left"
            :x2="chartWidth - PADDING.right"
            :y1="PADDING.top + plotHeight"
            :y2="PADDING.top + plotHeight"
            stroke="#b8bec7"
            stroke-width="1"
          />
        </svg>

        <div v-if="hoveredItem" class="chart-tooltip" :style="{ left: `${tooltipLeft}px` }">
          <div class="text-weight-medium">Semana del {{ weekLabel(hoveredItem.week) }}</div>
          <div v-for="series in SERIES" :key="series.key" class="row items-center no-wrap">
            <span class="legend-swatch" :style="{ background: series.color }" />
            {{ series.label }}: <b class="q-ml-xs">{{ hoveredItem[series.key] }}</b>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-section v-else>
      <q-markup-table flat dense bordered>
        <thead>
          <tr>
            <th class="text-left">Semana</th>
            <th class="text-right">Recibidos</th>
            <th class="text-right">Resueltos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.week">
            <td>{{ weekLabel(item.week) }}</td>
            <td class="text-right">{{ item.created }}</td>
            <td class="text-right">{{ item.resolved }}</td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.chart-scroll {
  overflow-x: auto;
}
.chart-wrap {
  position: relative;
}
.axis-text {
  font-size: 11px;
  fill: #52514e;
}
.legend-swatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 6px;
}
.chart-tooltip {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  background: #fff;
  border: 1px solid #d8dde3;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #0b0b0b;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
</style>
