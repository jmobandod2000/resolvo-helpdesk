<script setup lang="ts">
interface Props {
  label: string;
  hint?: string;
}

defineProps<Props>();
const tags = defineModel<string[]>({ required: true });
</script>

<template>
  <q-select
    v-model="tags"
    :label="label"
    :hint="hint ?? 'Escribe y presiona Enter para agregar'"
    outlined
    dense
    multiple
    use-input
    use-chips
    hide-dropdown-icon
    input-debounce="0"
    new-value-mode="add-unique"
  />
</template>
