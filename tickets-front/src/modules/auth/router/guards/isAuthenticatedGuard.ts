import type { NavigationGuard } from 'vue-router';
import { LocalStorage } from 'quasar';

import { useAuthStore } from '../../stores/useAuthStore';
import { isJwtExpired } from '../../helpers/jwt';
import { AuthRoutes } from '../../interfaces/auth';

const isAuthenticatedGuard: NavigationGuard = async () => {
  const authStore = useAuthStore();
  const jwt = LocalStorage.getItem<string>('jwt');

  if (!jwt || isJwtExpired(jwt)) return { name: AuthRoutes.LOGIN };
  if (authStore.user.id) return true;

  const isAuthenticated = await authStore.checkUserJwt();
  return isAuthenticated ? true : { name: AuthRoutes.LOGIN };
};

export default isAuthenticatedGuard;
