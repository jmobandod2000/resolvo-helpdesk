import type { RouteRecordRaw } from 'vue-router';
import { GuideRoutes } from '../interfaces/guide';

const GuideRouter: RouteRecordRaw[] = [
  {
    path: 'guide',
    name: GuideRoutes.GUIDE,
    component: () => import('../pages/GuidePage.vue'),
  },
];

export default GuideRouter;
