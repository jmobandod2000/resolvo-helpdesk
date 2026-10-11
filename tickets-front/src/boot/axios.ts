import { boot } from 'quasar/wrappers';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { LocalStorage } from 'quasar';
import { i18n } from 'src/i18n';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// En producción, sin BASE_URL_PROD se usa la misma dirección de la web (la API sirve el front en Docker)
const baseURL = process.env.DEV
  ? process.env.BASE_URL || 'http://localhost:3010/api'
  : process.env.BASE_URL_PROD || '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const jwt = LocalStorage.getItem<string>('jwt');
  if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
  config.headers['x-lang'] = i18n.global.locale.value;
  return config;
});

export default boot(({ app, router }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && router.currentRoute.value.name !== 'login') {
        LocalStorage.remove('jwt');
        void router.replace({ name: 'login' });
      }
      return Promise.reject(error);
    },
  );
});

export { api };
