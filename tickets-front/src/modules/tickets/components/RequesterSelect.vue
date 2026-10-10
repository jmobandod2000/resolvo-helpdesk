<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ValidationRule } from 'quasar';
import { useI18n } from 'vue-i18n';

import { useUsersQuery } from 'src/modules/users/composables/useUsersQuery';

interface RequesterOption {
  label: string;
  value: string;
  email: string;
  initials: string;
}

defineProps<{ label: string; rules?: ValidationRule[] }>();
const model = defineModel<string>({ required: true });

const { t } = useI18n();
const { users } = useUsersQuery();

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

const allOptions = computed<RequesterOption[]>(() =>
  users.value
    .filter((user) => user.isActive)
    .map((user) => ({
      label: user.name,
      value: user.name,
      email: user.email,
      initials: initialsOf(user.name),
    })),
);

const filteredOptions = ref<RequesterOption[]>([]);

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const filterOptions = (value: string, update: (callback: () => void) => void) =>
  update(() => {
    const term = normalize(value);
    filteredOptions.value = allOptions.value.filter(
      (option) =>
        normalize(option.label).includes(term) || normalize(option.email).includes(term),
    );
  });
</script>

<template>
  <q-select
    :model-value="model"
    :options="filteredOptions"
    :label="label"
    :rules="rules"
    :hint="t('tickets.hints.requester')"
    outlined
    dense
    use-input
    fill-input
    hide-selected
    emit-value
    map-options
    input-debounce="0"
    @filter="filterOptions"
    @input-value="(value: string) => (model = value)"
    @update:model-value="(value: string | null) => (model = value ?? '')"
  >
    <template #prepend><q-icon name="sym_r_person" /></template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section avatar>
          <q-avatar size="28px" color="blue-1" text-color="primary" class="text-caption">
            {{ scope.opt.initials }}
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
          <q-item-label caption>{{ scope.opt.email }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
