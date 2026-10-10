import { useMutation } from '@tanstack/vue-query';

import useNotify from 'src/modules/shared/composables/useNotify';
import useHandlerErrors from 'src/modules/shared/composables/useHandlerErrors';
import useVueQuery from 'src/modules/shared/composables/useVueQuery';
import { createUser, deleteUser, updateUser } from '../api/usersApi';
import type { UserPayload } from '../interfaces/user';

export const useUserMutations = () => {
  const { successNotify } = useNotify();
  const { handleApiResponseError } = useHandlerErrors();
  const { invalidQuery } = useVueQuery();

  const invalidateUsers = () => invalidQuery({ queryKey: ['users'] });

  const createMutation = useMutation({
    mutationFn: (payload: UserPayload) => createUser(payload),
    onSuccess: (user) => {
      successNotify(`Usuario ${user.name} creado`);
      invalidateUsers();
    },
    onError: handleApiResponseError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UserPayload> }) =>
      updateUser(id, payload),
    onSuccess: (user) => {
      successNotify(`Usuario ${user.name} actualizado`);
      invalidateUsers();
    },
    onError: handleApiResponseError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: (user) => {
      successNotify(`Usuario ${user.name} eliminado`);
      invalidateUsers();
    },
    onError: handleApiResponseError,
  });

  return { createMutation, updateMutation, deleteMutation };
};
