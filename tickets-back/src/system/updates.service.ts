import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { APP_VERSION } from '../common/utils/app-version';

const RELEASES_URL =
  'https://api.github.com/repos/jmobandod2000/resolvo-helpdesk/releases/latest';
const CACHE_MS = 12 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 5000;
const NOTES_MAX = 2000;

interface LatestRelease {
  version: string;
  url: string;
  publishedAt: string | null;
  notes: string;
}

export interface UpdateStatus {
  enabled: boolean;
  current: string;
  latest: string | null;
  updateAvailable: boolean;
  url: string | null;
  publishedAt: string | null;
  notes: string | null;
  checkedAt: string | null;
}

// "1.10.0" > "1.9.2"; ignora el prefijo v y sufijos como -beta
const compareVersions = (a: string, b: string) => {
  const parse = (value: string) =>
    value
      .replace(/^v/, '')
      .split('-')[0]
      .split('.')
      .map((part) => Number(part) || 0);
  const [left, right] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i++)
    if ((left[i] ?? 0) !== (right[i] ?? 0))
      return (left[i] ?? 0) - (right[i] ?? 0);
  return 0;
};

// Consulta el último Release publicado en GitHub. Solo envía una petición GET sin datos de la instalación.
@Injectable()
export class UpdatesService {
  private readonly logger = new Logger('Updates');
  private cache: { release: LatestRelease | null; checkedAt: Date } | null =
    null;
  private pending: Promise<LatestRelease | null> | null = null;

  constructor(private readonly configService: ConfigService) {}

  private get enabled() {
    return this.configService.get('UPDATE_CHECK') !== false;
  }

  async getStatus(): Promise<UpdateStatus> {
    const base: UpdateStatus = {
      enabled: this.enabled,
      current: APP_VERSION,
      latest: null,
      updateAvailable: false,
      url: null,
      publishedAt: null,
      notes: null,
      checkedAt: null,
    };
    if (!this.enabled) return base;

    const release = await this.latestRelease();
    if (!release) return { ...base, checkedAt: this.checkedAt };
    return {
      ...base,
      latest: release.version,
      updateAvailable: compareVersions(release.version, APP_VERSION) > 0,
      url: release.url,
      publishedAt: release.publishedAt,
      notes: release.notes,
      checkedAt: this.checkedAt,
    };
  }

  private get checkedAt() {
    return this.cache?.checkedAt.toISOString() ?? null;
  }

  private async latestRelease() {
    if (this.cache && Date.now() - this.cache.checkedAt.getTime() < CACHE_MS)
      return this.cache.release;
    this.pending ??= this.fetchLatest().finally(() => (this.pending = null));
    const release = await this.pending;
    this.cache = { release, checkedAt: new Date() };
    return release;
  }

  private async fetchLatest(): Promise<LatestRelease | null> {
    try {
      const response = await fetch(RELEASES_URL, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': `Resolvo/${APP_VERSION}`,
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) return null;
      const body = (await response.json()) as {
        tag_name?: string;
        html_url?: string;
        published_at?: string;
        body?: string;
      };
      if (!body.tag_name) return null;
      return {
        version: body.tag_name.replace(/^v/, ''),
        url: body.html_url ?? '',
        publishedAt: body.published_at ?? null,
        notes: (body.body ?? '').slice(0, NOTES_MAX),
      };
    } catch (error) {
      this.logger.warn(
        `No se pudo consultar la última versión: ${(error as Error).message}`,
      );
      return null;
    }
  }
}
