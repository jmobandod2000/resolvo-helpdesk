<script setup lang="ts">
import { computed } from 'vue';
import type { CountByKey } from '../interfaces/metrics';

interface Props {
  title: string;
  items: CountByKey[];
  emptyText?: string;
}

const props = withDefaults(defineProps<Props>(), { emptyText: 'Sin datos en el periodo' });
const emit = defineEmits<{ select: [item: CountByKey] }>();

const maxCount = computed(() => Math.max(1, ...props.items.map((item) => item.count)));
const totalCount = computed(() => props.items.reduce((sum, item) => sum + item.count, 0));

const widthOf = (count: number) => `${Math.max((count / maxCount.value) * 100, 2)}%`;
const shareOf = (count: number) =>
  totalCount.value ? `${Math.round((count / totalCount.value) * 100)}%` : '0%';
</script>

<template>
  <q-card flat bordered class="full-height">
    <q-card-section class="section-title q-pb-sm">{{ title }}</q-card-section>
    <q-card-section class="q-pt-none">
      <div v-if="!items.length" class="text-grey-6 text-italic">{{ emptyText }}</div>
      <div
        v-for="item in items"
        :key="item.key"
        class="bar-row cursor-pointer"
        @click="emit('select', item)"
      >
        <div class="row items-baseline no-wrap q-mb-xs">
          <div class="col ellipsis text-body2">{{ item.label }}</div>
          <div class="text-body2 text-weight-medium q-ml-sm">{{ item.count }}</div>
          <div class="text-caption text-grey-7 q-ml-xs share">{{ shareOf(item.count) }}</div>
        </div>
        <div class="bar-track">
          <div class="bar-fill" :style="{ width: widthOf(item.count) }" />
        </div>
        <q-tooltip anchor="top middle" self="bottom middle">
          {{ item.label }}: {{ item.count }} tickets ({{ shareOf(item.count) }})
        </q-tooltip>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.bar-row {
  padding: 4px 0;
}
.bar-row:hover .bar-fill {
  background: #1c5cab;
}
.bar-track {
  height: 8px;
  border-radius: 4px;
  background: #eceff3;
}
.bar-fill {
  height: 8px;
  border-radius: 4px;
  background: #2a78d6;
}
.share {
  width: 36px;
  text-align: right;
}
</style>
