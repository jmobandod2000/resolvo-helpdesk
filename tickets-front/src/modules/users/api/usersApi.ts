import { api } from 'src/boot/axios';
import type { User, UserPayload } from '../interfaces/user';

const REQUEST_OPTIONS = {
  timeout: 1000 * 10,
  timeoutErrorMessage: 'Tiempo de espera agotado al consultar los usuarios',
};

export const getUsers = async () => {
  const resp = await api.get<User[]>('users', REQUEST_OPTIONS);
  return resp.data;
};

export const createUser = async (payload: UserPayload) => {
  const resp = await api.post<User>('users', payload, REQUEST_OPTIONS);
  return resp.data;
};

export const updateUser = async (id: number, payload: Partial<UserPayload>) => {
  const resp = await api.patch<User>(`users/${id}`, payload, REQUEST_OPTIONS);
  return resp.data;
};

export const deleteUser = async (id: number) => {
  const resp = await api.delete<User>(`users/${id}`, REQUEST_OPTIONS);
  return resp.data;
};
