import { api } from 'src/boot/axios';
import type { AuthUser, LoginForm } from '../interfaces/auth';

export const signIn = async ({ email, password }: LoginForm) => {
  const resp = await api.post<AuthUser>(
    'auth/login',
    { email, password },
    {
      timeout: 1000 * 10,
      timeoutErrorMessage: 'Tiempo de espera agotado para iniciar sesión',
    },
  );
  return resp.data;
};

export const validateJwt = async () => {
  const resp = await api.get<AuthUser>('auth/check-auth-token', {
    timeout: 1000 * 10,
    timeoutErrorMessage: 'Tiempo de espera agotado para validar la sesión',
  });
  return resp.data;
};
