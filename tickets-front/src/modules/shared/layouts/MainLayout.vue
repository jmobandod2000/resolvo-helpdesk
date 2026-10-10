<script setup lang="ts">
import { computed, ref } from 'vue';
import useAuth from 'src/modules/auth/composables/useAuth';

interface MenuLink {
  label: string;
  icon: string;
  to: { name: string };
  adminOnly?: boolean;
}

const { user, isAdmin, logout } = useAuth();
const isDrawerOpen = ref(true);

const links: MenuLink[] = [
  { label: 'Métricas', icon: 'sym_r_monitoring', to: { name: 'dashboard' } },
  { label: 'Tickets', icon: 'sym_r_confirmation_number', to: { name: 'tickets-list' } },
  { label: 'Nuevo ticket', icon: 'sym_r_add_circle', to: { name: 'ticket-create' } },
  { label: 'Usuarios', icon: 'sym_r_group', to: { name: 'users' }, adminOnly: true },
];

const visibleLinks = computed(() => links.filter((link) => !link.adminOnly || isAdmin.value));
</script>

<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-btn flat dense round icon="sym_r_menu" @click="isDrawerOpen = !isDrawerOpen" />
        <q-toolbar-title class="text-weight-medium">Tickets WMS</q-toolbar-title>
        <div class="q-mr-sm gt-xs">{{ user.name }}</div>
        <q-btn flat dense round icon="sym_r_logout" @click="logout">
          <q-tooltip>Cerrar sesión</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="isDrawerOpen" show-if-above bordered :width="230">
      <q-list padding>
        <q-item
          v-for="link in visibleLinks"
          :key="link.label"
          :to="link.to"
          clickable
          exact
          active-class="text-primary bg-blue-1"
        >
          <q-item-section avatar><q-icon :name="link.icon" /></q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
