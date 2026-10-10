import type { RouteRecordRaw } from 'vue-router';

const AboutRouter: RouteRecordRaw[] = [
  {
    path: 'about',
    name: 'about',
    component: () => import('../pages/AboutPage.vue'),
  },
];

export default AboutRouter;
