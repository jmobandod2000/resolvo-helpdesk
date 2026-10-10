<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import useLocaleAwareForm from 'src/modules/shared/composables/useLocaleAwareForm';
import type { User, UserPayload } from '../interfaces/user';

interface Props {
  user?: User | null;
  isSaving?: boolean;
}

const props = withDefaults(defineProps<Props>(), { user: null, isSaving: false });
const isOpen = defineModel<boolean>({ required: true });
const emit = defineEmits<{ save: [payload: UserPayload] }>();

const { t } = useI18n();
const formRef = useLocaleAwareForm();

const roleOptions = computed(() => [
  { value: 'user', label: t('enums.role.user') },
  { value: 'admin', label: t('enums.role.admin') },
]);

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

const requiredRule = (value: string) => !!value || t('common.requiredField');
const passwordRule = (value: string) =>
  (isEditing.value && !value) ||
  /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).{6,}$/.test(value) ||
  t('users.passwordRule');

const save = () => {
  const { password, ...payload } = form.value;
  emit('save', password ? { ...payload, password } : payload);
};
</script>

<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 440px; max-width: 95vw">
      <q-card-section class="section-title">
        {{ isEditing ? t('users.editUser') : t('users.newUser') }}
      </q-card-section>

      <q-form ref="formRef" @submit.prevent="save">
        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.name" :label="t('users.fields.name')" outlined dense :rules="[requiredRule]" />
          <q-input
            v-model="form.email"
            :label="t('users.fields.email')"
            type="email"
            outlined
            dense
            :rules="[requiredRule]"
          />
          <q-input
            v-model="form.password"
            :label="isEditing ? t('users.fields.newPassword') : t('users.fields.password')"
            type="password"
            outlined
            dense
            :rules="[passwordRule]"
          />
          <q-select
            v-model="form.roles"
            :options="roleOptions"
            :label="t('users.fields.role')"
            outlined
            dense
            emit-value
            map-options
          />
          <q-toggle v-if="isEditing" v-model="form.isActive" :label="t('users.fields.active')" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat :label="t('common.cancel')" />
          <q-btn type="submit" color="primary" unelevated :label="t('common.save')" :loading="isSaving" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
