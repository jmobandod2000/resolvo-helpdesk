import { useMutation } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';

import useNotify from 'src/modules/shared/composables/useNotify';
import useHandlerErrors from 'src/modules/shared/composables/useHandlerErrors';
import useVueQuery from 'src/modules/shared/composables/useVueQuery';
import {
  addTicketNote,
  changeTicketStatus,
  createTicket,
  deleteTicket,
  updateTicket,
} from '../api/ticketsApi';
import type { ChangeStatusPayload, TicketPayload } from '../interfaces/ticket';

export const useTicketMutations = () => {
  const { t } = useI18n();
  const { successNotify } = useNotify();
  const { handleApiResponseError } = useHandlerErrors();
  const { invalidQuery } = useVueQuery();

  const invalidateTicketQueries = () => {
    invalidQuery({ queryKey: ['tickets'] });
    invalidQuery({ queryKey: ['ticket'] });
    invalidQuery({ queryKey: ['metrics'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: TicketPayload) => createTicket(payload),
    onSuccess: (ticket) => {
      successNotify(t('tickets.notify.created', { code: ticket.code }));
      invalidateTicketQueries();
    },
    onError: handleApiResponseError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<TicketPayload> }) =>
      updateTicket(id, payload),
    onSuccess: (ticket) => {
      successNotify(t('tickets.notify.updated', { code: ticket.code }));
      invalidateTicketQueries();
    },
    onError: handleApiResponseError,
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChangeStatusPayload }) =>
      changeTicketStatus(id, payload),
    onSuccess: (ticket) => {
      successNotify(t('tickets.notify.statusChanged', { code: ticket.code }));
      invalidateTicketQueries();
    },
    onError: handleApiResponseError,
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => addTicketNote(id, note),
    onSuccess: () => {
      successNotify(t('tickets.notify.noteAdded'));
      invalidateTicketQueries();
    },
    onError: handleApiResponseError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTicket(id),
    onSuccess: (ticket) => {
      successNotify(t('tickets.notify.deleted', { code: ticket.code }));
      invalidateTicketQueries();
    },
    onError: handleApiResponseError,
  });

  return {
    createMutation,
    updateMutation,
    changeStatusMutation,
    addNoteMutation,
    deleteMutation,
  };
};
