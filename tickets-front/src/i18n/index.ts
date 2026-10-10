import { createI18n } from 'vue-i18n';

import es from './es';
import enUS from './en-US';
import ptBR from './pt-BR';

export type MessageSchema = typeof es;

export type AppLocale = 'es' | 'en-US' | 'pt-BR';

export const APP_LOCALES: AppLocale[] = ['es', 'en-US', 'pt-BR'];

export const DEFAULT_LOCALE: AppLocale = 'es';

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: { es, 'en-US': enUS, 'pt-BR': ptBR },
});
