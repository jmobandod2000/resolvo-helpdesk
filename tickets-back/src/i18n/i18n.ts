import es from './messages/es';
import enUS from './messages/en-US';
import ptBR from './messages/pt-BR';

export type MessageSchema = typeof es;

export type AppLanguage = 'es' | 'en-US' | 'pt-BR';

export type TranslationArgs = Record<string, string | number>;

export interface TranslatableMessage {
  key: string;
  args?: TranslationArgs;
}

export const DEFAULT_LANGUAGE: AppLanguage = 'es';

const TRANSLATED_ARG_PREFIX = '@';

const MESSAGES: Record<AppLanguage, MessageSchema> = {
  es,
  'en-US': enUS,
  'pt-BR': ptBR,
};

const normalizeLanguage = (value: string): AppLanguage | null => {
  const code = value.trim().toLowerCase();
  if (code.startsWith('en')) return 'en-US';
  if (code.startsWith('pt')) return 'pt-BR';
  if (code.startsWith('es')) return 'es';
  return null;
};

export const resolveLanguage = (
  explicit?: string | string[],
  acceptLanguage?: string,
): AppLanguage => {
  const header = Array.isArray(explicit) ? explicit[0] : explicit;
  if (header) {
    const language = normalizeLanguage(header);
    if (language) return language;
  }

  for (const part of (acceptLanguage ?? '').split(',')) {
    const language = normalizeLanguage(part.split(';')[0]);
    if (language) return language;
  }

  return DEFAULT_LANGUAGE;
};

const lookup = (messages: MessageSchema, key: string): string | undefined => {
  const value = key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === 'object'
          ? (node as Record<string, unknown>)[part]
          : undefined,
      messages,
    );
  return typeof value === 'string' ? value : undefined;
};

export const hasTranslation = (language: AppLanguage, key: string) =>
  lookup(MESSAGES[language], key) !== undefined;

export const translate = (
  language: AppLanguage,
  key: string,
  args: TranslationArgs = {},
): string => {
  const template =
    lookup(MESSAGES[language], key) ??
    lookup(MESSAGES[DEFAULT_LANGUAGE], key) ??
    key;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = args[name];
    if (value === undefined) return match;
    return typeof value === 'string' && value.startsWith(TRANSLATED_ARG_PREFIX)
      ? translate(language, value.slice(TRANSLATED_ARG_PREFIX.length))
      : String(value);
  });
};

export const translatedArg = (key: string) => `${TRANSLATED_ARG_PREFIX}${key}`;

export const i18nMessage = (
  key: string,
  args?: TranslationArgs,
): TranslatableMessage => ({ key, ...(args && { args }) });

export const isTranslatableMessage = (
  value: unknown,
): value is TranslatableMessage =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as TranslatableMessage).key === 'string';
