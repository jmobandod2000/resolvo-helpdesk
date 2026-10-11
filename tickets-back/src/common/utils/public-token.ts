import { createHash, randomBytes } from 'crypto';

export const generatePublicToken = () => randomBytes(32).toString('base64url');

export const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

export const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;
