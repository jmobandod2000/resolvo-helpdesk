import { boot } from 'quasar/wrappers';
import { VueQueryPlugin } from '@tanstack/vue-query';

export default boot(({ app }) => {
  VueQueryPlugin.install(app, {
    queryClientConfig: {
      defaultOptions: {
        queries: {
          staleTime: 1000 * 30,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    },
  });
});
