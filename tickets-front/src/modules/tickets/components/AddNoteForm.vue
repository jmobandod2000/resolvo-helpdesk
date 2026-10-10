<script setup lang="ts">
import { ref } from 'vue';

defineProps<{ isSaving?: boolean }>();
const emit = defineEmits<{ save: [note: string] }>();

const note = ref('');

const save = () => {
  const text = note.value.trim();
  if (text.length < 2) return;
  emit('save', text);
  note.value = '';
};
</script>

<template>
  <q-form class="row q-col-gutter-sm items-start" @submit.prevent="save">
    <div class="col">
      <q-input
        v-model="note"
        placeholder="Agregar nota de seguimiento"
        type="textarea"
        outlined
        dense
        autogrow
      />
    </div>
    <div class="col-auto">
      <q-btn type="submit" color="primary" unelevated icon="sym_r_send" :loading="isSaving" />
    </div>
  </q-form>
</template>
