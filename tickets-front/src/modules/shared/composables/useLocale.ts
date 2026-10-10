import { computed } from 'vue';
import { Lang, LocalStorage } from 'quasar';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/pt-br';
import quasarEs from 'quasar/lang/es';
import quasarEnUs from 'quasar/lang/en-US';
import quasarPtBr from 'quasar/lang/pt-BR';

import { APP_LOCALES, DEFAULT_LOCALE, i18n } from 'src/i18n';
import type { AppLocale } from 'src/i18n';

const LOCALE_KEY = 'locale';

type QuasarLangPack = Parameters<typeof Lang.set>[0];

const QUASAR_LANGS: Record<AppLocale, QuasarLangPack> = {
  es: quasarEs as QuasarLangPack,
  'en-US': quasarEnUs as QuasarLangPack,
  'pt-BR': quasarPtBr as QuasarLangPack,
};

const DAYJS_LOCALES: Record<AppLocale, string> = {
  es: 'es',
  'en-US': 'en',
  'pt-BR': 'pt-br',
};

export const toDayjsLocale = (locale: string) => DAYJS_LOCALES[locale as AppLocale] ?? 'es';

const isAppLocale = (value: unknown): value is AppLocale =>
  APP_LOCALES.includes(value as AppLocale);

const readSavedLocale = () => {
  try {
    return LocalStorage.getItem<string>(LOCALE_KEY);
  } catch {
    return null;
  }
};

export const detectLocale = (): AppLocale => {
  const saved = readSavedLocale();
  if (isAppLocale(saved)) return saved;

  const browserLanguage = navigator.language.toLowerCase();
  if (browserLanguage.startsWith('en')) return 'en-US';
  if (browserLanguage.startsWith('pt')) return 'pt-BR';
  return DEFAULT_LOCALE;
};

export const applyLocale = (locale: AppLocale) => {
  i18n.global.locale.value = locale;
  Lang.set(QUASAR_LANGS[locale]);
  dayjs.locale(DAYJS_LOCALES[locale]);
  document.documentElement.lang = locale;
};

const useLocale = () => {
  const locale = computed(() => i18n.global.locale.value as AppLocale);

  const setLocale = (value: AppLocale) => {
    applyLocale(value);
    try {
      LocalStorage.set(LOCALE_KEY, value);
    } catch {
      return;
    }
  };

  return { locale, locales: APP_LOCALES, setLocale };
};

export default useLocale;
