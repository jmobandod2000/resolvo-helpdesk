import type { RouteRecordRaw } from 'vue-router';
import { AuthRoutes } from '../interfaces/auth';

const AuthRouter: RouteRecordRaw = {
  path: '/auth',
  component: () => import('../layouts/AuthLayout.vue'),
  children: [
    {
      path: 'login',
      name: AuthRoutes.LOGIN,
      component: () => import('../pages/LoginPage.vue'),
    },
  ],
};

export default AuthRouter;
