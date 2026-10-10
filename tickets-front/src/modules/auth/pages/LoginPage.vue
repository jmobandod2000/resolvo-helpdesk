<script setup lang="ts">
import { onMounted, ref } from 'vue';
import useAuth from '../composables/useAuth';

const { loginForm, login, loadRememberedEmail } = useAuth();
const isPasswordVisible = ref(false);

const requiredRule = (value: string) => !!value || 'Campo requerido';
const emailRule = (value: string) => /.+@.+\..+/.test(value) || 'Correo no válido';

onMounted(loadRememberedEmail);
</script>

<template>
  <q-page class="row flex-center bg-primary q-pa-md">
    <q-card class="login-card q-pa-md" flat>
      <q-card-section class="text-center">
        <q-icon name="sym_r_confirmation_number" size="48px" color="primary" />
        <div class="text-h6 text-primary q-mt-sm">Tickets WMS</div>
        <div class="text-caption text-grey-7">Seguimiento interno de soporte</div>
      </q-card-section>

      <q-form class="q-gutter-md" @submit.prevent="login">
        <q-input
          v-model="loginForm.email"
          label="Correo"
          type="email"
          outlined
          autofocus
          :rules="[requiredRule, emailRule]"
        >
          <template #prepend><q-icon name="sym_r_mail" /></template>
        </q-input>

        <q-input
          v-model="loginForm.password"
          label="Contraseña"
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

        <q-checkbox v-model="loginForm.remember" label="Recordar correo" />

        <q-btn type="submit" color="primary" label="Ingresar" class="full-width" unelevated />
      </q-form>
    </q-card>
  </q-page>
</template>

<style scoped>
.login-card {
  width: 100%;
  max-width: 380px;
}
</style>
