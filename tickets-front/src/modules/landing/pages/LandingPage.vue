<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { LocalStorage } from 'quasar';
import { useI18n } from 'vue-i18n';

import resolvoLogo from 'src/assets/brand/resolvo-logo.png';
import LanguageSelector from 'src/modules/shared/components/LanguageSelector.vue';
import AppFooterLinks from 'src/modules/shared/components/AppFooterLinks.vue';
import { isJwtExpired } from 'src/modules/auth/helpers/jwt';
import { AuthRoutes } from 'src/modules/auth/interfaces/auth';
import usePortalConfig from 'src/modules/portal/composables/usePortalConfig';
import usePortalStorage from 'src/modules/portal/composables/usePortalStorage';
import { PortalRoutes } from 'src/modules/portal/interfaces/portal';

const { t } = useI18n();
const router = useRouter();
const { config, isEnabled, isLoading } = usePortalConfig();
const { savedTickets } = usePortalStorage();

const hasSession = computed(() => {
  try {
    const jwt = LocalStorage.getItem('jwt');
    return typeof jwt === 'string' && !isJwtExpired(jwt);
  } catch {
    return false;
  }
});

const organizationName = computed(() => config.value?.organizationName ?? null);

const goTo = (name: string) => void router.push({ name });

const FEATURES = [
  { icon: 'sym_r_bolt', key: 'fast' },
  { icon: 'sym_r_visibility', key: 'tracking' },
  { icon: 'sym_r_shield_lock', key: 'private' },
] as const;
</script>

<template>
  <div class="landing">
    <div class="landing__glow landing__glow--left" />
    <div class="landing__glow landing__glow--right" />

    <header class="landing__top row items-center no-wrap">
      <q-space />
      <LanguageSelector dark />
    </header>

    <main class="landing__main column items-center">
      <img :src="resolvoLogo" :alt="t('app.name')" class="landing__logo" />
      <div v-if="organizationName" class="landing__org">{{ organizationName }}</div>
      <h1 class="landing__title">{{ t('landing.title') }}</h1>
      <p class="landing__subtitle">{{ t('landing.subtitle') }}</p>

      <div class="landing__cards row q-col-gutter-lg justify-center">
        <div class="col-12 col-md-6">
          <section class="role-card role-card--user column full-height">
            <div class="role-card__icon"><q-icon name="sym_r_support" size="34px" /></div>
            <div class="role-card__eyebrow">{{ t('landing.user.eyebrow') }}</div>
            <h2 class="role-card__title">{{ t('landing.user.title') }}</h2>
            <p class="role-card__text">{{ t('landing.user.text') }}</p>

            <q-space />

            <div v-if="isLoading" class="row justify-center q-py-md">
              <q-spinner-dots size="32px" color="primary" />
            </div>
            <template v-else-if="isEnabled">
              <q-btn
                unelevated
                no-caps
                no-wrap
                size="lg"
                color="primary"
                icon="sym_r_add_circle"
                class="full-width role-card__cta"
                :label="t('landing.user.report')"
                @click="goTo(PortalRoutes.NEW)"
              />
              <q-btn
                flat
                no-caps
                color="primary"
                icon="sym_r_search"
                class="full-width q-mt-xs"
                :label="
                  savedTickets.length
                    ? t('landing.user.mine', { n: savedTickets.length })
                    : t('landing.user.track')
                "
                @click="goTo(PortalRoutes.HOME)"
              />
            </template>
            <div v-else class="role-card__notice">
              <q-icon name="sym_r_info" size="20px" />
              <div>
                {{ t('landing.user.disabled') }}
                <a v-if="config?.contactEmail" :href="`mailto:${config.contactEmail}`">
                  {{ config.contactEmail }}
                </a>
              </div>
            </div>
          </section>
        </div>

        <div class="col-12 col-md-6">
          <section class="role-card role-card--team column full-height">
            <div class="role-card__icon role-card__icon--team">
              <q-icon name="sym_r_engineering" size="34px" />
            </div>
            <div class="role-card__eyebrow">{{ t('landing.team.eyebrow') }}</div>
            <h2 class="role-card__title">{{ t('landing.team.title') }}</h2>
            <p class="role-card__text">{{ t('landing.team.text') }}</p>
            <q-space />
            <q-btn
              unelevated
              no-caps
              no-wrap
              size="lg"
              color="dark"
              text-color="white"
              :icon="hasSession ? 'sym_r_dashboard' : 'sym_r_login'"
              class="full-width role-card__cta role-card__cta--team"
              :label="hasSession ? t('landing.team.continue') : t('landing.team.signIn')"
              @click="goTo(hasSession ? 'dashboard' : AuthRoutes.LOGIN)"
            />
          </section>
        </div>
      </div>

      <div class="landing__features row justify-center q-col-gutter-md">
        <div v-for="feature in FEATURES" :key="feature.key" class="col-12 col-sm-4">
          <div class="feature row no-wrap items-start">
            <q-icon :name="feature.icon" size="22px" class="feature__icon" />
            <div>
              <div class="feature__title">{{ t(`landing.features.${feature.key}.title`) }}</div>
              <div class="feature__text">{{ t(`landing.features.${feature.key}.text`) }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="landing__footer">
      <AppFooterLinks dark />
    </footer>
  </div>
</template>

<style scoped>
.landing {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: radial-gradient(1200px 600px at 50% -10%, #1a3a8f 0%, #0b2149 55%, #071634 100%);
  color: #fff;
}
.landing__glow {
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.35;
  pointer-events: none;
}
.landing__glow--left {
  left: -200px;
  bottom: -160px;
  background: #00a896;
}
.landing__glow--right {
  right: -180px;
  top: 120px;
  background: #5b3df5;
}
.landing__top {
  position: relative;
  padding: 14px 20px;
}
.landing__main {
  position: relative;
  flex: 1;
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: 8px 16px 32px;
  text-align: center;
}
.landing__logo {
  width: 210px;
  max-width: 60vw;
  background: #fff;
  border-radius: 22px;
  padding: 14px 20px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  animation: float 6s ease-in-out infinite;
}
.landing__org {
  margin-top: 18px;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #9fc3ff;
  font-weight: 600;
}
.landing__title {
  margin: 10px 0 6px;
  font-size: clamp(1.9rem, 4.5vw, 2.8rem);
  font-weight: 800;
  line-height: 1.15;
}
.landing__subtitle {
  margin: 0 auto 28px;
  max-width: 560px;
  font-size: 1.05rem;
  color: #c9d6f2;
}
.landing__cards {
  width: 100%;
  text-align: left;
}
.role-card {
  background: #fff;
  color: #0b2149;
  border-radius: 20px;
  padding: 26px 24px 22px;
  min-height: 330px;
  box-shadow: 0 20px 50px rgba(4, 12, 32, 0.35);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.role-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 26px 60px rgba(4, 12, 32, 0.45);
}
.role-card__icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #1a4fd6, #5b3df5);
}
.role-card__icon--team {
  background: linear-gradient(135deg, #0b2149, #13306e);
}
.role-card__eyebrow {
  margin-top: 16px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #00a896;
}
.role-card__title {
  margin: 4px 0 6px;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.2;
}
.role-card__text {
  color: #4b5568;
  margin-bottom: 18px;
}
.role-card__cta {
  border-radius: 12px;
  min-height: 52px;
}
.role-card__cta--team {
  background: #0b2149 !important;
}
.role-card__notice {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fff4e5;
  color: #8a4b00;
  font-size: 0.92rem;
}
.landing__features {
  width: 100%;
  margin-top: 30px;
  text-align: left;
}
.feature {
  gap: 10px;
  padding: 10px 6px;
}
.feature__icon {
  color: #5ee0cf;
  margin-top: 2px;
}
.feature__title {
  font-weight: 700;
}
.feature__text {
  font-size: 0.88rem;
  color: #c9d6f2;
}
.landing__footer {
  position: relative;
  padding: 14px 16px 18px;
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .landing__logo,
  .role-card {
    animation: none;
    transition: none;
  }
}
</style>
