import { useMutation } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';

import useNotify from 'src/modules/shared/composables/useNotify';
import useHandlerErrors from 'src/modules/shared/composables/useHandlerErrors';
import useVueQuery from 'src/modules/shared/composables/useVueQuery';
import { createUser, deleteUser, updateUser } from '../api/usersApi';
import type { UserPayload } from '../interfaces/user';

export const useUserMutations = () => {
  const { t } = useI18n();
  const { successNotify } = useNotify();
  const { handleApiResponseError } = useHandlerErrors();
  const { invalidQuery } = useVueQuery();

  const invalidateUsers = () => invalidQuery({ queryKey: ['users'] });

  const createMutation = useMutation({
    mutationFn: (payload: UserPayload) => createUser(payload),
    onSuccess: (user) => {
      successNotify(t('users.notify.created', { name: user.name }));
      invalidateUsers();
    },
    onError: handleApiResponseError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UserPayload> }) =>
      updateUser(id, payload),
    onSuccess: (user) => {
      successNotify(t('users.notify.updated', { name: user.name }));
      invalidateUsers();
    },
    onError: handleApiResponseError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: (user) => {
      successNotify(t('users.notify.deleted', { name: user.name }));
      invalidateUsers();
    },
    onError: handleApiResponseError,
  });

  return { createMutation, updateMutation, deleteMutation };
};
