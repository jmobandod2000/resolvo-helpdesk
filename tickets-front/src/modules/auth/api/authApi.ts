import { api } from 'src/boot/axios';
import { i18n } from 'src/i18n';
import type { AuthUser, LoginForm } from '../interfaces/auth';

export const signIn = async ({ email, password }: LoginForm) => {
  const resp = await api.post<AuthUser>(
    'auth/login',
    { email, password },
    {
      timeout: 1000 * 10,
      timeoutErrorMessage: i18n.global.t('errors.timeout.login'),
    },
  );
  return resp.data;
};

export const validateJwt = async () => {
  const resp = await api.get<AuthUser>('auth/check-auth-token', {
    timeout: 1000 * 10,
    timeoutErrorMessage: i18n.global.t('errors.timeout.session'),
  });
  return resp.data;
};
