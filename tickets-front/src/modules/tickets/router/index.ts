import type { RouteRecordRaw } from 'vue-router';
import { TicketRoutes } from '../interfaces/ticket-routes';

const TicketsRouter: RouteRecordRaw[] = [
  {
    path: 'tickets',
    name: TicketRoutes.LIST,
    component: () => import('../pages/TicketsListPage.vue'),
  },
  {
    path: 'tickets/new',
    name: TicketRoutes.CREATE,
    component: () => import('../pages/TicketFormPage.vue'),
  },
  {
    path: 'tickets/:id(\\d+)/edit',
    name: TicketRoutes.EDIT,
    component: () => import('../pages/TicketFormPage.vue'),
  },
  {
    path: 'tickets/:term',
    name: TicketRoutes.DETAIL,
    component: () => import('../pages/TicketDetailPage.vue'),
  },
];

export default TicketsRouter;
