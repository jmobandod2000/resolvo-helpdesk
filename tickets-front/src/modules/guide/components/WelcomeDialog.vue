<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import useAuth from 'src/modules/auth/composables/useAuth';
import useGuide from '../composables/useGuide';
import { GuideRoutes } from '../interfaces/guide';

const { t } = useI18n();
const router = useRouter();
const { isLogged } = useAuth();
const { hasSeenGuide, markGuideSeen } = useGuide();

const isOpen = ref(false);

watch(
  [isLogged, hasSeenGuide],
  ([logged, seen]) => {
    isOpen.value = logged && !seen;
  },
  { immediate: true },
);

const start = () => {
  isOpen.value = false;
  void router.push({ name: GuideRoutes.GUIDE });
};

const skip = () => {
  markGuideSeen();
  isOpen.value = false;
};
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 420px; max-width: 95vw">
      <q-card-section class="text-center q-pt-lg">
        <q-icon name="sym_r_waving_hand" size="48px" color="primary" />
        <div class="text-h6 q-mt-sm">{{ t('guide.welcome.title', { app: t('app.name') }) }}</div>
        <div class="text-grey-7 q-mt-xs">{{ t('guide.welcome.message') }}</div>
      </q-card-section>
      <q-card-actions align="center" class="q-pb-lg">
        <q-btn flat color="primary" :label="t('guide.welcome.skip')" @click="skip" />
        <q-btn color="primary" unelevated icon="sym_r_school" :label="t('guide.welcome.start')" @click="start" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
