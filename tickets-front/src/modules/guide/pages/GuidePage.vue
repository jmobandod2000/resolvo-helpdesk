<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import useGuide from '../composables/useGuide';
import { GUIDE_STEPS, GUIDE_TIP_KEYS } from '../interfaces/guide';

const { t } = useI18n();
const router = useRouter();
const { markGuideSeen } = useGuide();

const step = ref(GUIDE_STEPS[0]!.key);
const isLastStep = (index: number) => index === GUIDE_STEPS.length - 1;

const finish = () => void router.push({ name: 'dashboard' });

onMounted(markGuideSeen);
</script>

<template>
  <q-page padding>
    <div class="q-mb-md">
      <div class="page-title">{{ t('guide.title') }}</div>
      <div class="text-grey-7">{{ t('guide.subtitle') }}</div>
    </div>

    <q-stepper v-model="step" vertical animated flat bordered color="primary" header-nav>
      <q-step
        v-for="(item, index) in GUIDE_STEPS"
        :key="item.key"
        :name="item.key"
        :title="t(`guide.steps.${item.key}.title`)"
        :icon="item.icon"
        :done="GUIDE_STEPS.findIndex((current) => current.key === step) > index"
      >
        <div class="text-body1 q-mb-sm">{{ t(`guide.steps.${item.key}.body`) }}</div>
        <q-list dense>
          <q-item v-for="tip in GUIDE_TIP_KEYS" :key="tip">
            <q-item-section avatar>
              <q-icon name="sym_r_check_circle" color="positive" />
            </q-item-section>
            <q-item-section class="text-body2">
              {{ t(`guide.steps.${item.key}.${tip}`) }}
            </q-item-section>
          </q-item>
        </q-list>

        <q-stepper-navigation class="q-gutter-sm">
          <q-btn
            v-if="!isLastStep(index)"
            color="primary"
            unelevated
            :label="t('guide.next')"
            @click="step = GUIDE_STEPS[index + 1]!.key"
          />
          <q-btn v-else color="primary" unelevated :label="t('guide.finish')" @click="finish" />
          <q-btn
            v-if="index > 0"
            flat
            color="primary"
            :label="t('guide.back')"
            @click="step = GUIDE_STEPS[index - 1]!.key"
          />
          <q-btn
            v-if="item.to"
            flat
            color="primary"
            icon-right="sym_r_arrow_forward"
            :label="t('guide.goTo')"
            :to="item.to"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-page>
</template>
