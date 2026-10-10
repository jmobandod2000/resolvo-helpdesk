import type { RouteRecordRaw } from 'vue-router';
import isAdminGuard from 'src/modules/auth/router/guards/isAdminGuard';
import { OrganizationRoutes } from '../interfaces/organization';

const OrganizationRouter: RouteRecordRaw[] = [
  {
    path: 'setup',
    name: OrganizationRoutes.SETUP,
    beforeEnter: [isAdminGuard],
    component: () => import('../pages/SetupPage.vue'),
  },
  {
    path: 'settings',
    name: OrganizationRoutes.SETTINGS,
    beforeEnter: [isAdminGuard],
    component: () => import('../pages/SettingsPage.vue'),
  },
];

export default OrganizationRouter;
