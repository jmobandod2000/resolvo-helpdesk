import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';

import { getUsers } from '../api/usersApi';

export const useUsersQuery = () => {
  const { data, isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5,
  });

  const users = computed(() => data.value ?? []);

  const userOptions = computed(() =>
    users.value
      .filter((user) => user.isActive)
      .map((user) => ({ value: user.id, label: user.name })),
  );

  return { users, userOptions, isFetching };
};
