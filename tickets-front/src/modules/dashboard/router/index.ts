import type { RouteRecordRaw } from 'vue-router';

const DashboardRouter: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'dashboard',
    component: () => import('../pages/DashboardPage.vue'),
  },
];

export default DashboardRouter;
