import { api } from 'src/boot/axios';
import { i18n } from 'src/i18n';
import type { PaginatedResponse } from 'src/modules/shared/interfaces/pagination';
import type {
  ChangeStatusPayload,
  Ticket,
  TicketDetail,
  TicketEvent,
  TicketFilters,
  TicketPayload,
} from '../interfaces/ticket';

const REQUEST_OPTIONS = {
  timeout: 1000 * 15,
  timeoutErrorMessage: i18n.global.t('errors.timeout.tickets'),
};

const buildQueryParams = (filters: TicketFilters, limit: number, offset: number) => ({
  limit,
  offset,
  ...(filters.search.trim() && { search: filters.search.trim() }),
  ...(filters.status.length && { status: filters.status.join(',') }),
  ...(filters.siteId && { siteId: filters.siteId }),
  ...(filters.categoryId && { categoryId: filters.categoryId }),
  ...(filters.priority && { priority: filters.priority }),
  ...(filters.rootCause && { rootCause: filters.rootCause }),
  ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
  ...(filters.onlyOpen && { onlyOpen: true }),
});

export const getTickets = async (filters: TicketFilters, limit: number, offset: number) => {
  const resp = await api.get<PaginatedResponse<Ticket>>('tickets', {
    ...REQUEST_OPTIONS,
    params: buildQueryParams(filters, limit, offset),
  });
  return resp.data;
};

export const getTicket = async (term: string) => {
  const resp = await api.get<TicketDetail>(`tickets/${term}`, REQUEST_OPTIONS);
  return resp.data;
};

export const createTicket = async (payload: TicketPayload) => {
  const resp = await api.post<Ticket>('tickets', payload, REQUEST_OPTIONS);
  return resp.data;
};

export const updateTicket = async (id: number, payload: Partial<TicketPayload>) => {
  const resp = await api.patch<Ticket>(`tickets/${id}`, payload, REQUEST_OPTIONS);
  return resp.data;
};

export const changeTicketStatus = async (id: number, payload: ChangeStatusPayload) => {
  const resp = await api.patch<Ticket>(`tickets/${id}/status`, payload, REQUEST_OPTIONS);
  return resp.data;
};

export const addTicketNote = async (id: number, note: string, isPublic = false) => {
  const resp = await api.post<TicketEvent>(
    `tickets/${id}/notes`,
    { note, isPublic },
    REQUEST_OPTIONS,
  );
  return resp.data;
};

export const getTicketPublicLink = async (id: number) => {
  const resp = await api.post<{ token: string }>(
    `tickets/${id}/public-link`,
    {},
    REQUEST_OPTIONS,
  );
  return resp.data;
};

export const deleteTicket = async (id: number) => {
  const resp = await api.delete<Pick<Ticket, 'id' | 'code'>>(`tickets/${id}`, REQUEST_OPTIONS);
  return resp.data;
};
