import { readFileSync } from 'fs';
import { join } from 'path';

// Versión instalada, leída del package.json de la API (en Docker y en desarrollo)
const readVersion = (): string => {
  try {
    const pkg = JSON.parse(
      readFileSync(join(__dirname, '..', '..', '..', 'package.json'), 'utf8'),
    ) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
};

export const APP_VERSION = readVersion();
