import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { Loading, LocalStorage } from 'quasar';

import useNotify from 'src/modules/shared/composables/useNotify';
import useVueQuery from 'src/modules/shared/composables/useVueQuery';
import { useAuthStore } from '../stores/useAuthStore';
import { signIn } from '../api/authApi';
import type { LoginForm } from '../interfaces/auth';
import { AuthRoutes } from '../interfaces/auth';

const REMEMBERED_EMAIL_KEY = 'rememberedEmail';

const useAuth = () => {
  const router = useRouter();
  const { errorNotify } = useNotify();
  const { removeAllQueries } = useVueQuery();
  const authStore = useAuthStore();

  const { user, loginForm, isAdmin, isLogged } = storeToRefs(authStore);

  const rememberEmail = (form: LoginForm) => {
    if (form.remember) LocalStorage.set(REMEMBERED_EMAIL_KEY, form.email);
    else LocalStorage.remove(REMEMBERED_EMAIL_KEY);
  };

  const loadRememberedEmail = () => {
    const email = LocalStorage.getItem<string>(REMEMBERED_EMAIL_KEY);
    if (email) loginForm.value = { ...loginForm.value, email, remember: true };
  };

  const login = async () => {
    Loading.show({ message: 'Comprobando credenciales, por favor espere...' });
    try {
      authStore.setUser(await signIn(loginForm.value));
      rememberEmail(loginForm.value);
      loginForm.value.password = '';
      void router.push('/');
    } catch {
      errorNotify('Correo o contraseña inválidos');
    } finally {
      Loading.hide();
    }
  };

  const logout = () => {
    removeAllQueries();
    authStore.clearUser();
    LocalStorage.remove('jwt');
    void router.replace({ name: AuthRoutes.LOGIN });
  };

  return {
    user,
    loginForm,
    isAdmin,
    isLogged,
    login,
    logout,
    loadRememberedEmail,
  };
};

export default useAuth;
