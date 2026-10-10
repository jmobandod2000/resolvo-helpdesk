export enum GuideRoutes {
  GUIDE = 'guide',
}

export interface GuideStep {
  key: string;
  icon: string;
  to?: { name: string };
}

export const GUIDE_STEPS: GuideStep[] = [
  { key: 'create', icon: 'sym_r_add_circle', to: { name: 'ticket-create' } },
  { key: 'follow', icon: 'sym_r_chat' },
  { key: 'status', icon: 'sym_r_swap_horiz' },
  { key: 'close', icon: 'sym_r_task_alt' },
  { key: 'search', icon: 'sym_r_search', to: { name: 'tickets-list' } },
  { key: 'metrics', icon: 'sym_r_monitoring', to: { name: 'dashboard' } },
  { key: 'settings', icon: 'sym_r_tune' },
];

export const GUIDE_TIP_KEYS = ['tip1', 'tip2', 'tip3'] as const;
