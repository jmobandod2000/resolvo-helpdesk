import type { RouteRecordRaw } from 'vue-router';

const ReportsRouter: RouteRecordRaw[] = [
  {
    path: 'reports',
    name: 'reports',
    component: () => import('../pages/ReportsPage.vue'),
  },
];

export default ReportsRouter;
