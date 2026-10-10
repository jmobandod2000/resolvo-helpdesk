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

const baseURL = process.env.DEV ? process.env.BASE_URL : process.env.BASE_URL_PROD;

const api = axios.create({ baseURL: baseURL || 'http://localhost:3010/api' });

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
