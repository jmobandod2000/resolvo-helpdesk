<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { User, UserPayload } from '../interfaces/user';

interface Props {
  user?: User | null;
  isSaving?: boolean;
}

const props = withDefaults(defineProps<Props>(), { user: null, isSaving: false });
const isOpen = defineModel<boolean>({ required: true });
const emit = defineEmits<{ save: [payload: UserPayload] }>();

const roleOptions = [
  { value: 'user', label: 'Analista' },
  { value: 'admin', label: 'Administrador' },
];

const buildEmptyForm = (): UserPayload => ({
  name: '',
  email: '',
  password: '',
  roles: 'user',
  isActive: true,
});

const form = ref<UserPayload>(buildEmptyForm());
const isEditing = computed(() => !!props.user);

watch(isOpen, (open) => {
  if (!open) return;
  form.value = props.user
    ? {
        name: props.user.name,
        email: props.user.email,
        password: '',
        roles: props.user.roles,
        isActive: props.user.isActive,
      }
    : buildEmptyForm();
});

const requiredRule = (value: string) => !!value || 'Campo requerido';
const passwordRule = (value: string) =>
  (isEditing.value && !value) ||
  /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).{6,}$/.test(value) ||
  'Mínimo 6 caracteres, con mayúscula, minúscula y número';

const save = () => {
  const { password, ...payload } = form.value;
  emit('save', password ? { ...payload, password } : payload);
};
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 440px; max-width: 95vw">
      <q-card-section class="section-title">
        {{ isEditing ? 'Editar usuario' : 'Nuevo usuario' }}
      </q-card-section>

      <q-form @submit.prevent="save">
        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.name" label="Nombre" outlined dense :rules="[requiredRule]" />
          <q-input
            v-model="form.email"
            label="Correo"
            type="email"
            outlined
            dense
            :rules="[requiredRule]"
          />
          <q-input
            v-model="form.password"
            :label="isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'"
            type="password"
            outlined
            dense
            :rules="[passwordRule]"
          />
          <q-select
            v-model="form.roles"
            :options="roleOptions"
            label="Rol"
            outlined
            dense
            emit-value
            map-options
          />
          <q-toggle v-if="isEditing" v-model="form.isActive" label="Activo" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Cancelar" />
          <q-btn type="submit" color="primary" unelevated label="Guardar" :loading="isSaving" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
