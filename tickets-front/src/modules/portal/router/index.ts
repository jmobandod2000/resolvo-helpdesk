import type { RouteRecordRaw } from 'vue-router';
import { PortalRoutes } from '../interfaces/portal';

const PortalRouter: RouteRecordRaw = {
  path: '/portal',
  component: () => import('../layouts/PortalLayout.vue'),
  children: [
    {
      path: '',
      name: PortalRoutes.HOME,
      component: () => import('../pages/PortalHomePage.vue'),
    },
    {
      path: 'nuevo',
      name: PortalRoutes.NEW,
      component: () => import('../pages/PortalNewTicketPage.vue'),
    },
    {
      path: 't/:token([A-Za-z0-9_-]{43})',
      name: PortalRoutes.TRACK,
      component: () => import('../pages/PortalTrackPage.vue'),
    },
  ],
};

export default PortalRouter;
