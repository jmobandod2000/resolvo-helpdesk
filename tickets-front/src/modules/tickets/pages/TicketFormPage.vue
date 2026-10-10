<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useLocaleAwareForm from 'src/modules/shared/composables/useLocaleAwareForm';

import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import { useUsersQuery } from 'src/modules/users/composables/useUsersQuery';
import { useSites } from 'src/modules/organization/composables/useSites';
import { useCategories } from 'src/modules/organization/composables/useCategories';
import useAuth from 'src/modules/auth/composables/useAuth';
import TagsInput from '../components/TagsInput.vue';
import RequesterSelect from '../components/RequesterSelect.vue';
import { useTicketForm } from '../composables/useTicketForm';
import { useTicketQuery } from '../composables/useTicketQuery';
import { useTicketMutations } from '../composables/useTicketMutations';
import { TicketRoutes } from '../interfaces/ticket-routes';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const formRef = useLocaleAwareForm();
const { catalogs } = useCatalogs();
const { userOptions } = useUsersQuery();
const { siteOptions } = useSites();
const { categoryOptions } = useCategories();
const categoryRule = (value: unknown) =>
  !categoryOptions.value.length || !!value || t('common.requiredField');
const { user } = useAuth();
const { form, loadTicket, buildPayload } = useTicketForm();
const { createMutation, updateMutation } = useTicketMutations();

const ticketId = computed(() => route.params.id as string | undefined);
const isEditing = computed(() => !!ticketId.value);
const { ticket } = useTicketQuery(ticketId);

watch(
  siteOptions,
  (options) => {
    if (!isEditing.value && !form.value.siteId && options.length === 1)
      form.value.siteId = options[0]!.value;
  },
  { immediate: true },
);

watch(
  ticket,
  (value) => {
    if (value) loadTicket(value);
  },
  { immediate: true },
);

watch(
  user,
  (value) => {
    if (isEditing.value) return;
    if (!form.value.assigneeId && value.id) form.value.assigneeId = value.id;
    if (!form.value.requesterName && value.name) form.value.requesterName = value.name;
  },
  { immediate: true },
);

const isSaving = computed(() => createMutation.isPending.value || updateMutation.isPending.value);

const requiredRule = (value: unknown) => !!value || t('common.requiredField');
const minLengthRule = (value: string) =>
  (value?.trim().length ?? 0) >= 5 || t('common.minLength', { min: 5 });

const save = async () => {
  const payload = buildPayload();
  const saved = ticket.value
    ? await updateMutation.mutateAsync({ id: ticket.value.id, payload })
    : await createMutation.mutateAsync(payload);
  void router.push({ name: TicketRoutes.DETAIL, params: { term: saved.code } });
};
</script>

<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <q-btn flat round dense icon="sym_r_arrow_back" class="q-mr-sm" @click="router.back()" />
      <div class="page-title col">
        {{ isEditing ? t('tickets.editTicket', { code: ticket?.code ?? '' }) : t('tickets.newTicket') }}
      </div>
    </div>

    <q-form ref="formRef" @submit.prevent="save">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-lg-8">
          <q-card flat bordered>
            <q-card-section class="section-title">{{ t('tickets.sections.request') }}</q-card-section>
            <q-card-section class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input
                  v-model="form.title"
                  :label="t('tickets.fields.title')"
                  outlined
                  dense
                  counter
                  maxlength="160"
                  :rules="[minLengthRule]"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.description"
                  :label="t('tickets.fields.description')"
                  type="textarea"
                  outlined
                  autogrow
                  :rules="[minLengthRule]"
                />
              </div>
              <div class="col-12 col-sm-6">
                <RequesterSelect
                  v-model="form.requesterName"
                  :label="t('tickets.fields.requester')"
                  :rules="[requiredRule]"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.requesterArea" :label="t('tickets.fields.area')" outlined dense />
              </div>
              <div class="col-12 col-sm-6">
                <TagsInput v-model="form.productCodes" :label="t('tickets.fields.productCodes')" />
              </div>
              <div class="col-12 col-sm-6">
                <TagsInput v-model="form.documents" :label="t('tickets.fields.documents')" />
              </div>
            </q-card-section>

            <q-card-section class="section-title">{{ t('tickets.sections.diagnosis') }}</q-card-section>
            <q-card-section class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input
                  v-model="form.diagnosis"
                  :label="t('tickets.fields.diagnosis')"
                  type="textarea"
                  outlined
                  autogrow
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model.number="form.affectedUnits"
                  :label="t('tickets.fields.affectedUnits')"
                  type="number"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="form.devRequestRef"
                  :label="t('tickets.fields.devRequestRef')"
                  outlined
                  dense
                />
              </div>
              <div class="col-12">
                <TagsInput
                  v-model="form.evidencePaths"
                  :label="t('tickets.fields.evidencePaths')"
                />
              </div>
              <template v-if="isEditing">
                <div class="col-12 col-sm-4">
                  <q-select
                    v-model="form.rootCause"
                    :options="catalogs.rootCauses"
                    :label="t('tickets.fields.rootCause')"
                    outlined
                    dense
                    emit-value
                    map-options
                    clearable
                  />
                </div>
                <div class="col-12 col-sm-8">
                  <q-input
                    v-model="form.closureComment"
                    :label="t('tickets.fields.closureComment')"
                    type="textarea"
                    outlined
                    autogrow
                  />
                </div>
              </template>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-4">
          <q-card flat bordered>
            <q-card-section class="section-title">{{ t('tickets.sections.classification') }}</q-card-section>
            <q-card-section class="q-gutter-sm">
              <q-select
                v-model="form.siteId"
                :options="siteOptions"
                :label="t('tickets.fields.site')"
                :placeholder="form.siteId ? undefined : t('sites.general')"
                :hint="t('tickets.hints.site')"
                outlined
                dense
                emit-value
                map-options
                clearable
                bottom-slots
              />
              <q-select
                v-model="form.categoryId"
                :options="categoryOptions"
                :label="t('tickets.fields.category')"
                outlined
                dense
                emit-value
                map-options
                :rules="[categoryRule]"
              />
              <q-select
                v-model="form.priority"
                :options="catalogs.priorities"
                :label="t('tickets.fields.priority')"
                outlined
                dense
                emit-value
                map-options
              />
              <q-select
                v-model="form.channel"
                :options="catalogs.channels"
                :label="t('tickets.fields.channel')"
                outlined
                dense
                emit-value
                map-options
              />
              <q-select
                v-model="form.assigneeId"
                :options="userOptions"
                :label="t('tickets.fields.assignee')"
                outlined
                dense
                emit-value
                map-options
                clearable
              />
              <q-input
                v-model="form.reportedAt"
                :label="t('tickets.fields.reportedAt')"
                type="datetime-local"
                outlined
                dense
                stack-label
              />
            </q-card-section>
            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat :label="t('common.cancel')" @click="router.back()" />
              <q-btn type="submit" color="primary" unelevated :label="t('common.save')" :loading="isSaving" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </q-form>
  </q-page>
</template>
