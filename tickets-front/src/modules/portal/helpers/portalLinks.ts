const TOKEN_PATTERN = /[A-Za-z0-9_-]{43}/;

export const buildPortalUrl = (path = '') =>
  `${window.location.origin}${window.location.pathname}#/portal${path}`;

export const buildTrackingUrl = (token: string) => buildPortalUrl(`/t/${token}`);

export const extractToken = (value: string) => value.trim().match(TOKEN_PATTERN)?.[0] ?? null;
