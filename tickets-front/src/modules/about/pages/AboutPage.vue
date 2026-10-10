<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import resolvoIcon from 'src/assets/brand/resolvo-icon.png';
import SupportCard from 'src/modules/shared/components/SupportCard.vue';
import { APP_INFO } from 'src/modules/shared/config/app';
import { SUPPORT_METHODS } from 'src/modules/shared/config/support';

const { t } = useI18n();
const route = useRoute();
const supportSection = ref<HTMLElement | null>(null);

const details = computed(() => [
  { icon: 'sym_r_tag', label: t('about.version'), value: `v${APP_INFO.version}` },
  {
    icon: 'sym_r_gavel',
    label: t('about.license'),
    value: APP_INFO.license,
    href: APP_INFO.licenseUrl,
  },
  { icon: 'sym_r_person', label: t('about.author'), value: APP_INFO.author },
  {
    icon: 'sym_r_code',
    label: t('about.repository'),
    value: APP_INFO.repositoryUrl.replace('https://', ''),
    href: APP_INFO.repositoryUrl,
  },
  { icon: 'sym_r_stacks', label: t('about.stack'), value: t('about.stackValue') },
  { icon: 'sym_r_translate', label: t('about.languages'), value: t('about.languagesValue') },
]);

const scrollToSection = async () => {
  if (route.query.section !== 'support') return;
  await nextTick();
  setTimeout(() => supportSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
};

onMounted(scrollToSection);
watch(() => route.query.section, scrollToSection);
</script>

<template>
  <q-page padding>
    <div class="about-container q-gutter-md">
      <q-card flat bordered>
        <q-card-section class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <img :src="resolvoIcon" :alt="t('app.name')" style="width: 72px; height: 72px" />
          </div>
          <div class="col">
            <div class="row items-center q-gutter-sm">
              <div class="text-h6 text-weight-medium">{{ t('app.name') }}</div>
              <q-badge outline color="primary">v{{ APP_INFO.version }}</q-badge>
            </div>
            <div class="text-body2 text-grey-8">{{ t('about.description') }}</div>
          </div>
          <div class="col-12 col-sm-auto row q-gutter-sm">
            <q-btn
              outline
              no-caps
              color="primary"
              icon="sym_r_code"
              :label="t('about.viewSource')"
              :href="APP_INFO.repositoryUrl"
              target="_blank"
              rel="noopener noreferrer"
            />
            <q-btn
              flat
              no-caps
              color="primary"
              icon="sym_r_bug_report"
              :label="t('about.reportIssue')"
              :href="APP_INFO.issuesUrl"
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered>
        <q-card-section class="section-title">{{ t('about.details') }}</q-card-section>
        <q-separator />
        <q-list separator>
          <q-item v-for="item in details" :key="item.label">
            <q-item-section avatar><q-icon :name="item.icon" color="grey-7" /></q-item-section>
            <q-item-section>
              <q-item-label caption>{{ item.label }}</q-item-label>
              <q-item-label>
                <a v-if="item.href" :href="item.href" target="_blank" rel="noopener noreferrer">
                  {{ item.value }}
                </a>
                <span v-else>{{ item.value }}</span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>

      <q-card flat bordered>
        <q-card-section class="row no-wrap q-gutter-md">
          <q-icon name="sym_r_shield_lock" size="28px" color="positive" />
          <div>
            <div class="section-title">{{ t('about.privacyTitle') }}</div>
            <div class="text-body2 text-grey-8">{{ t('about.privacy') }}</div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="row no-wrap q-gutter-md">
          <q-icon name="sym_r_gavel" size="28px" color="grey-7" />
          <div>
            <div class="section-title">{{ t('about.licenseTitle') }}</div>
            <div class="text-body2 text-grey-8">
              {{ t('about.licenseText', { license: APP_INFO.license }) }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div v-if="SUPPORT_METHODS.length" ref="supportSection" class="scroll-target">
        <SupportCard />
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.about-container {
  max-width: 900px;
  margin: 0 auto;
}
.about-container a {
  color: var(--q-primary);
  text-decoration: none;
}
.about-container a:hover {
  text-decoration: underline;
}
.scroll-target {
  scroll-margin-top: 64px;
}
</style>
