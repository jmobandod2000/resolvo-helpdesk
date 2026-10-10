<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import { useUsersQuery } from 'src/modules/users/composables/useUsersQuery';
import useAuth from 'src/modules/auth/composables/useAuth';
import TagsInput from '../components/TagsInput.vue';
import { useTicketForm } from '../composables/useTicketForm';
import { useTicketQuery } from '../composables/useTicketQuery';
import { useTicketMutations } from '../composables/useTicketMutations';
import { TicketRoutes } from '../interfaces/ticket-routes';

const route = useRoute();
const router = useRouter();
const { catalogs } = useCatalogs();
const { userOptions } = useUsersQuery();
const { user } = useAuth();
const { form, loadTicket, buildPayload } = useTicketForm();
const { createMutation, updateMutation } = useTicketMutations();

const ticketId = computed(() => route.params.id as string | undefined);
const isEditing = computed(() => !!ticketId.value);
const { ticket } = useTicketQuery(ticketId);

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
    if (!isEditing.value && !form.value.assigneeId && value.id) form.value.assigneeId = value.id;
  },
  { immediate: true },
);

const isSaving = computed(() => createMutation.isPending.value || updateMutation.isPending.value);

const requiredRule = (value: unknown) => !!value || 'Campo requerido';
const minLengthRule = (value: string) => (value?.trim().length ?? 0) >= 5 || 'Mínimo 5 caracteres';

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
        {{ isEditing ? `Editar ${ticket?.code ?? ''}` : 'Nuevo ticket' }}
      </div>
    </div>

    <q-form @submit.prevent="save">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-lg-8">
          <q-card flat bordered>
            <q-card-section class="section-title">Solicitud</q-card-section>
            <q-card-section class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input
                  v-model="form.title"
                  label="Título"
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
                  label="Mensaje original del solicitante"
                  type="textarea"
                  outlined
                  autogrow
                  :rules="[minLengthRule]"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.requesterName"
                  label="Solicitante"
                  outlined
                  dense
                  :rules="[requiredRule]"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.requesterArea" label="Área" outlined dense />
              </div>
              <div class="col-12 col-sm-6">
                <TagsInput v-model="form.productCodes" label="Códigos de producto" />
              </div>
              <div class="col-12 col-sm-6">
                <TagsInput v-model="form.documents" label="Pedidos, facturas o documentos" />
              </div>
            </q-card-section>

            <q-card-section class="section-title">Diagnóstico</q-card-section>
            <q-card-section class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input
                  v-model="form.diagnosis"
                  label="Diagnóstico técnico"
                  type="textarea"
                  outlined
                  autogrow
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model.number="form.affectedUnits"
                  label="Unidades involucradas"
                  type="number"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="form.devRequestRef"
                  label="Referencia de solicitud a desarrollo"
                  outlined
                  dense
                />
              </div>
              <div class="col-12">
                <TagsInput
                  v-model="form.evidencePaths"
                  label="Evidencias (rutas de informes, scripts o archivos)"
                />
              </div>
              <template v-if="isEditing">
                <div class="col-12 col-sm-4">
                  <q-select
                    v-model="form.rootCause"
                    :options="catalogs.rootCauses"
                    label="Causa raíz"
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
                    label="Comentario de cierre"
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
            <q-card-section class="section-title">Clasificación</q-card-section>
            <q-card-section class="q-gutter-sm">
              <q-select
                v-model="form.company"
                :options="catalogs.companies"
                label="Sede"
                outlined
                dense
                emit-value
                map-options
                :rules="[requiredRule]"
              />
              <q-select
                v-model="form.category"
                :options="catalogs.categories"
                label="Categoría"
                outlined
                dense
                emit-value
                map-options
                :rules="[requiredRule]"
              />
              <q-select
                v-model="form.priority"
                :options="catalogs.priorities"
                label="Prioridad"
                outlined
                dense
                emit-value
                map-options
              />
              <q-select
                v-model="form.channel"
                :options="catalogs.channels"
                label="Canal"
                outlined
                dense
                emit-value
                map-options
              />
              <q-select
                v-model="form.assigneeId"
                :options="userOptions"
                label="Asignado a"
                outlined
                dense
                emit-value
                map-options
                clearable
              />
              <q-input
                v-model="form.reportedAt"
                label="Fecha y hora del reporte"
                type="datetime-local"
                outlined
                dense
                stack-label
              />
            </q-card-section>
            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat label="Cancelar" @click="router.back()" />
              <q-btn type="submit" color="primary" unelevated label="Guardar" :loading="isSaving" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </q-form>
  </q-page>
</template>
