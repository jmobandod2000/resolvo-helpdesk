import type { RouteRecordRaw } from 'vue-router';
import isAdminGuard from 'src/modules/auth/router/guards/isAdminGuard';

const UsersRouter: RouteRecordRaw[] = [
  {
    path: 'users',
    name: 'users',
    beforeEnter: [isAdminGuard],
    component: () => import('../pages/UsersPage.vue'),
  },
];

export default UsersRouter;
