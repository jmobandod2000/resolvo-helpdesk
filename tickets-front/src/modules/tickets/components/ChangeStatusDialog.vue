<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import useLocaleAwareForm from 'src/modules/shared/composables/useLocaleAwareForm';

import useCatalogs from 'src/modules/shared/composables/useCatalogs';
import type { ChangeStatusPayload, RootCause, Ticket, TicketStatus } from '../interfaces/ticket';

interface Props {
  ticket: Ticket;
  isSaving?: boolean;
}

const props = withDefaults(defineProps<Props>(), { isSaving: false });
const isOpen = defineModel<boolean>({ required: true });
const emit = defineEmits<{ save: [payload: ChangeStatusPayload] }>();

const { t } = useI18n();
const formRef = useLocaleAwareForm();
const { catalogs } = useCatalogs();

const status = ref<TicketStatus | null>(null);
const note = ref('');
const rootCause = ref<RootCause | null>(null);
const closureComment = ref('');

watch(isOpen, (open) => {
  if (!open) return;
  status.value = null;
  note.value = '';
  rootCause.value = props.ticket.rootCause;
  closureComment.value = props.ticket.closureComment ?? '';
});

const statusOptions = computed(() =>
  catalogs.value.statuses.filter((option) => option.value !== props.ticket.status),
);

const isClosing = computed(() => status.value === 'CLOSED' || status.value === 'RESOLVED');
const requiresClosureData = computed(() => status.value === 'CLOSED');

const requiredRule = (value: unknown) => !!value || t('common.requiredField');

const save = () => {
  if (!status.value) return;
  emit('save', {
    status: status.value,
    note: note.value.trim() || undefined,
    rootCause: rootCause.value ?? undefined,
    closureComment: closureComment.value.trim() || undefined,
  });
};
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 560px; max-width: 95vw">
      <q-card-section class="section-title">
        {{ t('tickets.statusDialog.title', { code: ticket.code }) }}
      </q-card-section>

      <q-form ref="formRef" @submit.prevent="save">
        <q-card-section class="q-gutter-sm">
          <q-select
            v-model="status"
            :options="statusOptions"
            :label="t('tickets.statusDialog.newStatus')"
            outlined
            dense
            emit-value
            map-options
            :rules="[requiredRule]"
          />
          <q-input v-model="note" :label="t('tickets.statusDialog.note')" type="textarea" outlined autogrow />

          <template v-if="isClosing">
            <q-select
              v-model="rootCause"
              :options="catalogs.rootCauses"
              :label="t('tickets.fields.rootCause')"
              outlined
              dense
              emit-value
              map-options
              :rules="requiresClosureData ? [requiredRule] : []"
            />
            <q-input
              v-model="closureComment"
              :label="t('tickets.statusDialog.closureComment')"
              type="textarea"
              outlined
              autogrow
              :rules="requiresClosureData ? [requiredRule] : []"
            />
          </template>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat :label="t('common.cancel')" />
          <q-btn type="submit" color="primary" unelevated :label="t('common.save')" :loading="isSaving" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
