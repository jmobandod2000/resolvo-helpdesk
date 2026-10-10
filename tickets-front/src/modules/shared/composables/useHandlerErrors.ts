import { isAxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import useNotify from './useNotify';

interface ApiErrorBody {
  message?: string | string[];
}

const extractServerMessage = (body: ApiErrorBody | undefined) => {
  if (!body?.message) return undefined;
  return Array.isArray(body.message) ? body.message.join('. ') : body.message;
};

const messageKeyByStatus: Record<number, string> = {
  401: 'errors.unauthorized',
  403: 'errors.forbidden',
  404: 'errors.notFound',
  409: 'errors.conflict',
  500: 'errors.server',
};

const useHandlerErrors = () => {
  const { t } = useI18n();
  const { errorNotify } = useNotify();

  const handleApiResponseError = (error: unknown) => {
    if (!isAxiosError<ApiErrorBody>(error)) {
      console.error('Unknown error', error);
      errorNotify(t('errors.request'));
      return;
    }

    if (!error.response) {
      console.error('Network error: no response from the server');
      errorNotify(t('errors.network'));
      return;
    }

    const { status, data } = error.response;
    const serverMessage = extractServerMessage(data);
    console.error(`Server error (${status}): ${serverMessage ?? 'no message'}`);

    const statusKey = messageKeyByStatus[status];
    errorNotify(serverMessage || (statusKey && t(statusKey)) || t('errors.unexpected'));
  };

  return { handleApiResponseError };
};

export default useHandlerErrors;
