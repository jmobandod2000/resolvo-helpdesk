<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

import useAuth from 'src/modules/auth/composables/useAuth';
import TicketStatusBadge from '../components/TicketStatusBadge.vue';
import TicketInfoCard from '../components/TicketInfoCard.vue';
import TicketTimeline from '../components/TicketTimeline.vue';
import TextBlockCard from '../components/TextBlockCard.vue';
import AddNoteForm from '../components/AddNoteForm.vue';
import ChangeStatusDialog from '../components/ChangeStatusDialog.vue';
import { useTicketQuery } from '../composables/useTicketQuery';
import { useTicketMutations } from '../composables/useTicketMutations';
import type { ChangeStatusPayload } from '../interfaces/ticket';
import { TicketRoutes } from '../interfaces/ticket-routes';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();
const { isAdmin } = useAuth();

const term = computed(() => route.params.term as string | undefined);
const { ticket, isLoading, isError } = useTicketQuery(term);
const { changeStatusMutation, addNoteMutation, deleteMutation } = useTicketMutations();

const isStatusDialogOpen = ref(false);

const changeStatus = async (payload: ChangeStatusPayload) => {
  if (!ticket.value) return;
  await changeStatusMutation.mutateAsync({ id: ticket.value.id, payload });
  isStatusDialogOpen.value = false;
};

const addNote = (note: string) => {
  if (ticket.value) addNoteMutation.mutate({ id: ticket.value.id, note });
};

const confirmDelete = () => {
  if (!ticket.value) return;
  const { id, code } = ticket.value;
  $q.dialog({
    title: t('tickets.actions.deleteTitle'),
    message: t('tickets.actions.deleteMessage', { code }),
    cancel: { flat: true, label: t('common.cancel') },
    ok: { color: 'negative', unelevated: true, label: t('common.delete') },
    persistent: true,
  }).onOk(async () => {
    await deleteMutation.mutateAsync(id);
    void router.replace({ name: TicketRoutes.LIST });
  });
};
</script>

<template>
  <q-page padding>
    <div v-if="isLoading" class="row flex-center q-pa-xl">
      <q-spinner size="40px" color="primary" />
    </div>

    <div v-else-if="isError || !ticket" class="text-center q-pa-xl text-grey-7">
      {{ t('tickets.notFound') }}
      <div class="q-mt-md">
        <q-btn flat color="primary" :label="t('tickets.backToList')" :to="{ name: TicketRoutes.LIST }" />
      </div>
    </div>

    <template v-else>
      <div class="row items-center q-col-gutter-sm q-mb-md">
        <div class="col-auto">
          <q-btn flat round dense icon="sym_r_arrow_back" :to="{ name: TicketRoutes.LIST }" />
        </div>
        <div class="col">
          <div class="text-caption text-grey-7">{{ ticket.code }}</div>
          <div class="page-title">{{ ticket.title }}</div>
        </div>
        <div class="col-auto"><TicketStatusBadge :status="ticket.status" /></div>
        <div class="col-auto q-gutter-sm">
          <q-btn
            color="primary"
            unelevated
            icon="sym_r_swap_horiz"
            :label="t('tickets.actions.changeStatus')"
            @click="isStatusDialogOpen = true"
          />
          <q-btn
            outline
            color="primary"
            icon="sym_r_edit"
            :label="t('common.edit')"
            :to="{ name: TicketRoutes.EDIT, params: { id: ticket.id } }"
          />
          <q-btn v-if="isAdmin" flat color="negative" icon="sym_r_delete" @click="confirmDelete">
            <q-tooltip>{{ t('common.delete') }}</q-tooltip>
          </q-btn>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-lg-8 q-gutter-y-md">
          <TextBlockCard
            :title="t('tickets.sections.requesterMessage')"
            :text="ticket.description"
          />
          <TextBlockCard
            :title="t('tickets.sections.diagnosis')"
            :text="ticket.diagnosis"
            :empty-text="t('tickets.empty.diagnosis')"
          />
          <TextBlockCard
            :title="t('tickets.sections.closureComment')"
            :text="ticket.closureComment"
            :empty-text="t('tickets.empty.closureComment')"
            copyable
          />

          <q-card v-if="ticket.devRequestRef || ticket.evidencePaths.length" flat bordered>
            <q-card-section class="section-title q-pb-none">
              {{ t('tickets.sections.evidence') }}
            </q-card-section>
            <q-list dense>
              <q-item v-if="ticket.devRequestRef">
                <q-item-section avatar><q-icon name="sym_r_code" color="accent" /></q-item-section>
                <q-item-section>
                  <q-item-label caption>{{ t('tickets.sections.devRequest') }}</q-item-label>
                  <q-item-label>{{ ticket.devRequestRef }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-for="path in ticket.evidencePaths" :key="path">
                <q-item-section avatar><q-icon name="sym_r_attach_file" /></q-item-section>
                <q-item-section class="text-body2" style="word-break: break-all">{{ path }}</q-item-section>
              </q-item>
            </q-list>
          </q-card>

          <q-card flat bordered>
            <q-card-section class="section-title q-pb-none">{{ t('tickets.sections.history') }}</q-card-section>
            <q-card-section>
              <AddNoteForm :is-saving="addNoteMutation.isPending.value" @save="addNote" />
            </q-card-section>
            <TicketTimeline :events="ticket.Events" />
          </q-card>
        </div>

        <div class="col-12 col-lg-4">
          <TicketInfoCard :ticket="ticket" />
        </div>
      </div>

      <ChangeStatusDialog
        v-model="isStatusDialogOpen"
        :ticket="ticket"
        :is-saving="changeStatusMutation.isPending.value"
        @save="changeStatus"
      />
    </template>
  </q-page>
</template>
