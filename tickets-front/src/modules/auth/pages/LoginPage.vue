<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useLocaleAwareForm from 'src/modules/shared/composables/useLocaleAwareForm';
import LanguageSelector from 'src/modules/shared/components/LanguageSelector.vue';
import resolvoLogo from 'src/assets/brand/resolvo-logo.png';
import AppFooterLinks from 'src/modules/shared/components/AppFooterLinks.vue';
import { usePublicProfile } from 'src/modules/organization/composables/useOrganization';
import useAuth from '../composables/useAuth';

const { t } = useI18n();
const formRef = useLocaleAwareForm();
const { loginForm, login, loadRememberedEmail } = useAuth();
const isPasswordVisible = ref(false);
const { organizationName, portalEnabled } = usePublicProfile();

const requiredRule = (value: string) => !!value || t('common.requiredField');
const emailRule = (value: string) => /.+@.+\..+/.test(value) || t('auth.invalidEmail');

onMounted(loadRememberedEmail);
</script>

<template>
  <q-page class="row flex-center bg-brand-gradient q-pa-md">
    <q-btn
      flat
      no-caps
      dense
      color="white"
      icon="sym_r_arrow_back"
      :label="t('landing.backToStart')"
      :to="{ name: 'landing' }"
      class="back-corner"
    />
    <LanguageSelector dark class="language-corner" />
    <q-card class="login-card q-pa-md" flat>
      <q-card-section class="text-center">
        <img :src="resolvoLogo" :alt="t('app.name')" style="width: 190px; max-width: 70%" />
        <div class="text-caption text-grey-7">{{ organizationName ?? t('app.subtitle') }}</div>
      </q-card-section>

      <q-form ref="formRef" class="q-gutter-md" @submit.prevent="login">
        <q-input
          v-model="loginForm.email"
          :label="t('auth.email')"
          type="email"
          outlined
          autofocus
          :rules="[requiredRule, emailRule]"
        >
          <template #prepend><q-icon name="sym_r_mail" /></template>
        </q-input>

        <q-input
          v-model="loginForm.password"
          :label="t('auth.password')"
          :type="isPasswordVisible ? 'text' : 'password'"
          outlined
          :rules="[requiredRule]"
        >
          <template #prepend><q-icon name="sym_r_lock" /></template>
          <template #append>
            <q-icon
              :name="isPasswordVisible ? 'sym_r_visibility_off' : 'sym_r_visibility'"
              class="cursor-pointer"
              @click="isPasswordVisible = !isPasswordVisible"
            />
          </template>
        </q-input>

        <q-checkbox v-model="loginForm.remember" :label="t('auth.rememberEmail')" />

        <q-btn type="submit" color="primary" :label="t('auth.signIn')" class="full-width" unelevated />
      </q-form>
      <div v-if="portalEnabled" class="text-center q-mt-md">
        <q-separator class="q-mb-md" />
        <div class="text-body2 text-grey-8">{{ t('auth.needHelp') }}</div>
        <q-btn
          flat
          no-caps
          color="primary"
          icon="sym_r_support_agent"
          :label="t('auth.openPortal')"
          :to="{ name: 'portal' }"
        />
      </div>
    </q-card>
    <AppFooterLinks dark class="login-footer" />
  </q-page>
</template>

<style scoped>
.login-card {
  width: 100%;
  max-width: 380px;
}
.login-footer {
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0;
}
.back-corner {
  position: absolute;
  top: 16px;
  left: 16px;
}
.language-corner {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>
