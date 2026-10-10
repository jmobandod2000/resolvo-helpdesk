import { isAxiosError } from 'axios';
import useNotify from './useNotify';

interface ApiErrorBody {
  message?: string | string[];
}

const extractServerMessage = (body: ApiErrorBody | undefined) => {
  if (!body?.message) return undefined;
  return Array.isArray(body.message) ? body.message.join('. ') : body.message;
};

const messageByStatus: Record<number, string> = {
  401: 'No autorizado. Por favor, inicia sesión.',
  403: 'Acceso denegado. No tienes permisos para realizar esta acción.',
  404: 'Recurso no encontrado.',
  409: 'Ya existe un registro con los mismos datos.',
  500: 'Error interno del servidor. Intenta nuevamente más tarde.',
};

const useHandlerErrors = () => {
  const { errorNotify } = useNotify();

  const handleApiResponseError = (error: unknown) => {
    if (!isAxiosError<ApiErrorBody>(error)) {
      console.error('Error desconocido', error);
      errorNotify('Error al procesar la petición. Intenta nuevamente.');
      return;
    }

    if (!error.response) {
      console.error('Error de red: no se recibió respuesta del servidor');
      errorNotify('No se pudo conectar con el servidor. Verifica tu conexión.');
      return;
    }

    const { status, data } = error.response;
    const serverMessage = extractServerMessage(data);
    console.error(`Error del servidor (${status}): ${serverMessage ?? 'sin mensaje'}`);

    const preferServerMessage = status === 400 || status === 404;
    errorNotify(
      (preferServerMessage && serverMessage) ||
        messageByStatus[status] ||
        serverMessage ||
        'Ocurrió un error inesperado. Intenta nuevamente.',
    );
  };

  return { handleApiResponseError };
};

export default useHandlerErrors;
