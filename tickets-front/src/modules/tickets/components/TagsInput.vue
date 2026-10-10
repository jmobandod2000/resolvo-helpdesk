<script setup lang="ts">
import { useI18n } from 'vue-i18n';

interface Props {
  label: string;
  hint?: string;
}

defineProps<Props>();
const tags = defineModel<string[]>({ required: true });
const { t } = useI18n();
</script>

<template>
  <q-select
    v-model="tags"
    :label="label"
    :hint="hint ?? t('common.tagsHint')"
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
