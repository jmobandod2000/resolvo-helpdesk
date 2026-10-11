import { api } from 'src/boot/axios';
import { i18n } from 'src/i18n';
import type {
  MyRequests,
  PortalConfig,
  PortalTicket,
  PortalTicketCreated,
  PortalTicketPayload,
} from '../interfaces/portal';

const requestOptions = () => ({
  timeout: 1000 * 15,
  timeoutErrorMessage: i18n.global.t('errors.timeout.portal'),
});

export const getPortalConfig = async () => {
  const resp = await api.get<PortalConfig>('portal/config', requestOptions());
  return resp.data;
};

export const createPortalTicket = async (payload: PortalTicketPayload) => {
  const resp = await api.post<PortalTicketCreated>('portal/tickets', payload, requestOptions());
  return resp.data;
};

export const getPortalTicket = async (token: string) => {
  const resp = await api.get<PortalTicket>(
    `portal/tickets/${encodeURIComponent(token)}`,
    requestOptions(),
  );
  return resp.data;
};

export const replyPortalTicket = async (token: string, message: string) => {
  const resp = await api.post<PortalTicket>(
    `portal/tickets/${encodeURIComponent(token)}/replies`,
    { message },
    requestOptions(),
  );
  return resp.data;
};

export const requestPortalAccess = async (email: string) => {
  const resp = await api.post<{ requested: boolean }>('portal/access', { email }, requestOptions());
  return resp.data;
};

export const getMyRequests = async (token: string) => {
  const resp = await api.get<MyRequests>(
    `portal/requests/${encodeURIComponent(token)}`,
    requestOptions(),
  );
  return resp.data;
};
