import type { NavigationGuard } from 'vue-router';
import { LocalStorage } from 'quasar';

import { useAuthStore } from '../../stores/useAuthStore';
import { isJwtExpired } from '../../helpers/jwt';
import { AuthRoutes } from '../../interfaces/auth';

const isAuthenticatedGuard: NavigationGuard = async (to) => {
  const authStore = useAuthStore();
  const jwt = LocalStorage.getItem<string>('jwt');

  const fallback = { name: to.name === 'dashboard' ? 'landing' : AuthRoutes.LOGIN };

  if (!jwt || isJwtExpired(jwt)) return fallback;
  if (authStore.user.id) return true;

  const isAuthenticated = await authStore.checkUserJwt();
  return isAuthenticated ? true : fallback;
};

export default isAuthenticatedGuard;
