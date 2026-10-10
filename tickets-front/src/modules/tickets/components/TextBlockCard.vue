<script setup lang="ts">
import { copyToClipboard } from 'quasar';
import useNotify from 'src/modules/shared/composables/useNotify';

interface Props {
  title: string;
  text: string | null;
  emptyText?: string;
  copyable?: boolean;
}

withDefaults(defineProps<Props>(), { emptyText: 'Sin información', copyable: false });

const { successNotify, errorNotify } = useNotify();

const copy = async (text: string) => {
  try {
    await copyToClipboard(text);
    successNotify('Texto copiado');
  } catch {
    errorNotify('No se pudo copiar el texto');
  }
};
</script>

<template>
  <q-card flat bordered>
    <q-card-section class="row items-center q-pb-none">
      <div class="section-title col">{{ title }}</div>
      <q-btn
        v-if="copyable && text"
        flat
        dense
        round
        icon="sym_r_content_copy"
        @click="copy(text)"
      >
        <q-tooltip>Copiar</q-tooltip>
      </q-btn>
    </q-card-section>
    <q-card-section>
      <div v-if="text" class="text-pre-line text-body2">{{ text }}</div>
      <div v-else class="text-grey-6 text-italic">{{ emptyText }}</div>
    </q-card-section>
  </q-card>
</template>
