import type { NavigationGuard } from 'vue-router';
import { useAuthStore } from '../../stores/useAuthStore';

const isAdminGuard: NavigationGuard = () => {
  const authStore = useAuthStore();
  return authStore.isAdmin ? true : { name: 'dashboard' };
};

export default isAdminGuard;
