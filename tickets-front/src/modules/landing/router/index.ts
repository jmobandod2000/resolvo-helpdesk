import type { RouteRecordRaw } from 'vue-router';

const LandingRouter: RouteRecordRaw = {
  path: '/bienvenida',
  name: 'landing',
  component: () => import('../pages/LandingPage.vue'),
};

export default LandingRouter;
