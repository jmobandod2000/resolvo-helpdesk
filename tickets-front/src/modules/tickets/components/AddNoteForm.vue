<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps<{ isSaving?: boolean }>();
const emit = defineEmits<{ save: [note: string, isPublic: boolean] }>();

const { t } = useI18n();
const note = ref('');
const isPublic = ref(false);

const save = () => {
  const text = note.value.trim();
  if (text.length < 2) return;
  emit('save', text, isPublic.value);
  note.value = '';
  isPublic.value = false;
};
</script>

<template>
  <q-form class="q-gutter-xs" @submit.prevent="save">
    <div class="row q-col-gutter-sm items-start">
      <div class="col">
        <q-input
          v-model="note"
          :placeholder="isPublic ? t('tickets.note.publicPlaceholder') : t('tickets.note.placeholder')"
          type="textarea"
          outlined
          dense
          autogrow
          maxlength="4000"
          :bg-color="isPublic ? 'blue-1' : undefined"
        />
      </div>
      <div class="col-auto">
        <q-btn type="submit" color="primary" unelevated icon="sym_r_send" :loading="isSaving" />
      </div>
    </div>
    <q-toggle
      v-model="isPublic"
      dense
      size="sm"
      color="primary"
      checked-icon="sym_r_visibility"
      unchecked-icon="sym_r_lock"
      :label="isPublic ? t('tickets.note.public') : t('tickets.note.internal')"
    />
  </q-form>
</template>
