import { readFileSync } from 'node:fs';
import { defineConfig } from '#q-app/wrappers';

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };

export default defineConfig(() => {
  return {
    boot: ['i18n', 'axios', 'vue-query'],

    css: ['app.scss'],

    extras: ['material-symbols-rounded', 'roboto-font'],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },

      typescript: {
        strict: true,
        vueShim: true,
      },

      vueRouterMode: 'hash',

      env: {
        APP_VERSION: version,
      },

      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            vueTsc: true,
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    devServer: {
      port: 9010,
      open: false,
    },

    framework: {
      iconSet: 'material-symbols-rounded',
      lang: 'es',
      config: {
        brand: {
          primary: '#1F3B63',
          secondary: '#2E6DA4',
          accent: '#7B4FB8',
          positive: '#2E7D32',
          negative: '#C62828',
          info: '#1976D2',
          warning: '#EF8A17',
        },
        notify: {},
      },
      plugins: ['Dialog', 'LocalStorage', 'Notify', 'Loading'],
    },

    animations: [],
  };
});
