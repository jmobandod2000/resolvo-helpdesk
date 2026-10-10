<script setup lang="ts">
interface Props {
  label: string;
  value: string | number;
  icon: string;
  caption?: string;
}

defineProps<Props>();
</script>

<template>
  <q-card flat bordered class="full-height">
    <q-card-section class="row items-center no-wrap">
      <div class="col">
        <div class="text-caption text-grey-7">{{ label }}</div>
        <div class="kpi-value">{{ value }}</div>
        <div v-if="caption" class="text-caption text-grey-6">{{ caption }}</div>
      </div>
      <q-icon :name="icon" size="32px" color="grey-5" />
    </q-card-section>
  </q-card>
</template>

<style scoped>
.kpi-value {
  font-size: 1.9rem;
  font-weight: 600;
  line-height: 1.2;
  color: #0b0b0b;
}
</style>
