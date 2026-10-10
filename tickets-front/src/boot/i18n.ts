import { boot } from 'quasar/wrappers';

import { i18n } from 'src/i18n';
import { applyLocale, detectLocale } from 'src/modules/shared/composables/useLocale';

export default boot(({ app }) => {
  app.use(i18n);
  applyLocale(detectLocale());
});
