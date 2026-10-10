import { computed } from 'vue';
import { LocalStorage } from 'quasar';

import useAuth from 'src/modules/auth/composables/useAuth';

const GUIDE_SEEN_KEY = 'guideSeen';

const readSeenUsers = (): number[] => {
  try {
    return LocalStorage.getItem<number[]>(GUIDE_SEEN_KEY) ?? [];
  } catch {
    return [];
  }
};

const useGuide = () => {
  const { user } = useAuth();

  const hasSeenGuide = computed(() => readSeenUsers().includes(user.value.id));

  const markGuideSeen = () => {
    const seen = readSeenUsers();
    if (seen.includes(user.value.id)) return;
    try {
      LocalStorage.set(GUIDE_SEEN_KEY, [...seen, user.value.id]);
    } catch {
      return;
    }
  };

  return { hasSeenGuide, markGuideSeen };
};

export default useGuide;
