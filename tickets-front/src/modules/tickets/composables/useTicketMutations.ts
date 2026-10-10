import { useMutation } from '@tanstack/vue-query';

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
      successNotify(`Ticket ${ticket.code} registrado`);
      invalidateTicketQueries();
    },
    onError: handleApiResponseError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<TicketPayload> }) =>
      updateTicket(id, payload),
    onSuccess: (ticket) => {
      successNotify(`Ticket ${ticket.code} actualizado`);
      invalidateTicketQueries();
    },
    onError: handleApiResponseError,
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChangeStatusPayload }) =>
      changeTicketStatus(id, payload),
    onSuccess: (ticket) => {
      successNotify(`Estado del ticket ${ticket.code} actualizado`);
      invalidateTicketQueries();
    },
    onError: handleApiResponseError,
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => addTicketNote(id, note),
    onSuccess: () => {
      successNotify('Nota agregada');
      invalidateTicketQueries();
    },
    onError: handleApiResponseError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTicket(id),
    onSuccess: (ticket) => {
      successNotify(`Ticket ${ticket.code} eliminado`);
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
