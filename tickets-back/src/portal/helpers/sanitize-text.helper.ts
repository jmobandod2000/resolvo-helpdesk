const CONTROL_CHARS = new RegExp(
  '[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]',
  'g',
);

export const cleanLine = (value: unknown) =>
  typeof value === 'string'
    ? value.replace(CONTROL_CHARS, '').replace(/\s+/g, ' ').trim()
    : value;

export const cleanText = (value: unknown) =>
  typeof value === 'string'
    ? value
        .replace(/\r\n?/g, '\n')
        .replace(CONTROL_CHARS, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    : value;

export const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;
