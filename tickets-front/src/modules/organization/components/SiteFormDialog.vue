<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import useLocaleAwareForm from 'src/modules/shared/composables/useLocaleAwareForm';
import type { Site, SitePayload } from '../interfaces/organization';

interface Props {
  site: Site | null;
  loading?: boolean;
}

const props = defineProps<Props>();
const isOpen = defineModel<boolean>({ required: true });
const emit = defineEmits<{ submit: [payload: SitePayload] }>();

const { t } = useI18n();
const formRef = useLocaleAwareForm();
const form = ref<SitePayload>({ code: null, name: '' });

watch(isOpen, (open) => {
  if (open) form.value = { code: props.site?.code ?? null, name: props.site?.name ?? '' };
});

const nameRule = (value: string) => (value?.trim().length ?? 0) >= 2 || t('sites.rules.name');

const submit = () =>
  emit('submit', { code: form.value.code?.trim() || null, name: form.value.name.trim() });
</script>

<template>
  <q-dialog v-model="isOpen">
    <q-card style="width: 460px; max-width: 95vw">
      <q-card-section class="text-h6">
        {{ site ? t('sites.editTitle') : t('sites.createTitle') }}
      </q-card-section>
      <q-form ref="formRef" @submit.prevent="submit">
        <q-card-section class="row q-col-gutter-md q-pt-none">
          <div class="col-12 col-sm-4">
            <q-input
              v-model="form.code"
              :label="t('sites.fields.code')"
              :hint="t('sites.hints.code')"
              outlined
              clearable
              maxlength="20"
            />
          </div>
          <div class="col-12 col-sm-8">
            <q-input
              v-model="form.name"
              :label="t('sites.fields.name')"
              :hint="t('sites.hints.name')"
              outlined
              autofocus
              maxlength="80"
              :rules="[nameRule]"
            />
          </div>
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
