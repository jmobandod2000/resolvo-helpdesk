import { api } from 'src/boot/axios';
import type { UpdateStatus } from '../interfaces/system';

export const getUpdateStatus = async () => {
  const resp = await api.get<UpdateStatus>('system/update');
  return resp.data;
};
