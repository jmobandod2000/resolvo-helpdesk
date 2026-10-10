import { onBeforeUnmount, watch } from 'vue';
import type { Ref } from 'vue';

const BADGE_PATTERN = /^\(\d+\+?\)\s/;

const useTitleBadge = (count: Ref<number>) => {
  const apply = (value: number) => {
    const base = document.title.replace(BADGE_PATTERN, '');
    document.title = value > 0 ? `(${value > 99 ? '99+' : value}) ${base}` : base;
  };

  watch(count, apply, { immediate: true });
  onBeforeUnmount(() => apply(0));
};

export default useTitleBadge;
