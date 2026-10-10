import type { RouteRecordRaw } from 'vue-router';

import AuthRouter from 'src/modules/auth/router';
import isAuthenticatedGuard from 'src/modules/auth/router/guards/isAuthenticatedGuard';
import DashboardRouter from 'src/modules/dashboard/router';
import TicketsRouter from 'src/modules/tickets/router';
import UsersRouter from 'src/modules/users/router';
import GuideRouter from 'src/modules/guide/router';
import ReportsRouter from 'src/modules/reports/router';
import AboutRouter from 'src/modules/about/router';
import OrganizationRouter from 'src/modules/organization/router';

const routes: RouteRecordRaw[] = [
  AuthRouter,
  {
    path: '/',
    component: () => import('src/modules/shared/layouts/MainLayout.vue'),
    beforeEnter: [isAuthenticatedGuard],
    redirect: { name: 'dashboard' },
    children: [...DashboardRouter, ...TicketsRouter, ...ReportsRouter, ...UsersRouter, ...GuideRouter, ...AboutRouter, ...OrganizationRouter],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/modules/shared/pages/NotFoundPage.vue'),
  },
];

export default routes;
