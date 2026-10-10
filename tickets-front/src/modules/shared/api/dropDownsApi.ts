import { api } from 'src/boot/axios';
import { i18n } from 'src/i18n';
import type { Catalogs } from '../interfaces/catalogs';

export const getCatalogs = async () => {
  const resp = await api.get<Catalogs>('drop-downs/catalogs', {
    timeout: 1000 * 10,
    timeoutErrorMessage: i18n.global.t('errors.timeout.catalogs'),
  });
  return resp.data;
};
