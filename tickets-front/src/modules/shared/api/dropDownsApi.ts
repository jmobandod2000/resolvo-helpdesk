import { api } from 'src/boot/axios';
import type { Catalogs } from '../interfaces/catalogs';

export const getCatalogs = async () => {
  const resp = await api.get<Catalogs>('drop-downs/catalogs', {
    timeout: 1000 * 10,
    timeoutErrorMessage: 'Tiempo de espera agotado al cargar los catálogos',
  });
  return resp.data;
};
