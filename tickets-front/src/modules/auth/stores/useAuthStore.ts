import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';

import { validateJwt } from '../api/authApi';
import type { AuthUser, LoginForm } from '../interfaces/auth';

const initialLoginForm: LoginForm = { email: '', password: '', remember: false };

const initialUser: AuthUser = {
  id: 0,
  name: '',
  email: '',
  roles: 'user',
  isActive: false,
  jwt: '',
};

export const useAuthStore = defineStore('auth', () => {
  const loginForm = ref<LoginForm>({ ...initialLoginForm });
  const user = ref<AuthUser>({ ...initialUser });

  const setUser = (authUser: AuthUser) => {
    user.value = authUser;
    LocalStorage.set('jwt', authUser.jwt);
  };

  const clearUser = () => {
    user.value = { ...initialUser };
  };

  const clearLoginForm = () => {
    loginForm.value = { ...initialLoginForm };
  };

  const checkUserJwt = async () => {
    try {
      setUser(await validateJwt());
      return true;
    } catch {
      return false;
    }
  };

  return {
    loginForm,
    user,

    isAdmin: computed(() => user.value.roles === 'admin'),
    isLogged: computed(() => user.value.id > 0),

    setUser,
    clearUser,
    clearLoginForm,
    checkUserJwt,
  };
});
