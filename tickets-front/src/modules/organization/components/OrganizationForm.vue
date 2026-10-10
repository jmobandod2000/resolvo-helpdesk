<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import useLocaleAwareForm from 'src/modules/shared/composables/useLocaleAwareForm';
import type { Organization, OrganizationPayload } from '../interfaces/organization';

interface Props {
  organization?: Organization | null | undefined;
  submitLabel: string;
  submitIcon?: string;
  loading?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ submit: [payload: OrganizationPayload] }>();

const { t } = useI18n();
const formRef = useLocaleAwareForm();

const toForm = (organization?: Organization | null): OrganizationPayload => ({
  name: organization?.name ?? '',
  taxId: organization?.taxId ?? null,
  email: organization?.email ?? null,
  phone: organization?.phone ?? null,
  address: organization?.address ?? null,
  website: organization?.website ?? null,
});

const form = ref<OrganizationPayload>(toForm(props.organization));

watch(
  () => props.organization,
  (value) => (form.value = toForm(value)),
);

const nameRule = (value: string) =>
  (value?.trim().length ?? 0) >= 2 || t('organization.rules.name');
const emailRule = (value: string | null) =>
  !value || /.+@.+\..+/.test(value) || t('auth.invalidEmail');

const submit = () => emit('submit', { ...form.value, name: form.value.name.trim() });
</script>

<template>
  <q-form ref="formRef" class="row q-col-gutter-md" @submit.prevent="submit">
    <div class="col-12 col-md-8">
      <q-input
        v-model="form.name"
        :label="t('organization.fields.name')"
        :hint="t('organization.hints.name')"
        outlined
        maxlength="120"
        :rules="[nameRule]"
        autofocus
      >
        <template #prepend><q-icon name="sym_r_apartment" /></template>
      </q-input>
    </div>
    <div class="col-12 col-md-4">
      <q-input
        v-model="form.taxId"
        :label="t('organization.fields.taxId')"
        :hint="t('organization.hints.taxId')"
        outlined
        clearable
        maxlength="40"
      >
        <template #prepend><q-icon name="sym_r_badge" /></template>
      </q-input>
    </div>
    <div class="col-12 col-md-6">
      <q-input
        v-model="form.email"
        :label="t('organization.fields.email')"
        :hint="t('organization.hints.email')"
        type="email"
        outlined
        clearable
        maxlength="120"
        :rules="[emailRule]"
      >
        <template #prepend><q-icon name="sym_r_mail" /></template>
      </q-input>
    </div>
    <div class="col-12 col-md-6">
      <q-input
        v-model="form.phone"
        :label="t('organization.fields.phone')"
        outlined
        clearable
        maxlength="40"
      >
        <template #prepend><q-icon name="sym_r_call" /></template>
      </q-input>
    </div>
    <div class="col-12 col-md-6">
      <q-input
        v-model="form.website"
        :label="t('organization.fields.website')"
        outlined
        clearable
        maxlength="120"
      >
        <template #prepend><q-icon name="sym_r_language" /></template>
      </q-input>
    </div>
    <div class="col-12 col-md-6">
      <q-input
        v-model="form.address"
        :label="t('organization.fields.address')"
        outlined
        clearable
        maxlength="200"
      >
        <template #prepend><q-icon name="sym_r_location_on" /></template>
      </q-input>
    </div>
    <div class="col-12 row justify-end q-gutter-sm">
      <slot name="actions" />
      <q-btn
        type="submit"
        unelevated
        no-caps
        color="primary"
        :icon-right="submitIcon"
        :label="submitLabel"
        :loading="loading"
      />
    </div>
  </q-form>
</template>
