<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import useLocaleAwareForm from 'src/modules/shared/composables/useLocaleAwareForm';
import type { Category, CategoryPayload } from '../interfaces/organization';

interface Props {
  category: Category | null;
  loading?: boolean;
}

const props = defineProps<Props>();
const isOpen = defineModel<boolean>({ required: true });
const emit = defineEmits<{ submit: [payload: CategoryPayload] }>();

const { t } = useI18n();
const formRef = useLocaleAwareForm();
const form = ref<CategoryPayload>({ name: '', description: null });

watch(isOpen, (open) => {
  if (open)
    form.value = {
      name: props.category?.name ?? '',
      description: props.category?.description ?? null,
    };
});

const nameRule = (value: string) =>
  (value?.trim().length ?? 0) >= 2 || t('categories.rules.name');

const submit = () =>
  emit('submit', {
    name: form.value.name.trim(),
    description: form.value.description?.trim() || null,
  });
</script>

<template>
  <q-dialog v-model="isOpen">
    <q-card style="width: 480px; max-width: 95vw">
      <q-card-section class="text-h6">
        {{ category ? t('categories.editTitle') : t('categories.createTitle') }}
      </q-card-section>
      <q-form ref="formRef" @submit.prevent="submit">
        <q-card-section class="q-gutter-md q-pt-none">
          <q-input
            v-model="form.name"
            :label="t('categories.fields.name')"
            :hint="t('categories.hints.name')"
            outlined
            autofocus
            maxlength="60"
            :rules="[nameRule]"
          />
          <q-input
            v-model="form.description"
            :label="t('categories.fields.description')"
            :hint="t('categories.hints.description')"
            outlined
            autogrow
            clearable
            maxlength="200"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps :label="t('common.cancel')" />
          <q-btn
            type="submit"
            unelevated
            no-caps
            color="primary"
            :label="t('common.save')"
            :loading="loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
