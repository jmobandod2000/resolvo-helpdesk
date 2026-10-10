export interface ResolvoConfig {
  apiUrl: string;
  email: string;
  password: string;
  language: string;
  appUrl: string | null;
  timeZone: string;
}

type Query = Record<string, string | number | boolean | undefined | null>;

export class ResolvoApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
};

export const loadConfig = (): ResolvoConfig => ({
  apiUrl: required('RESOLVO_API_URL').replace(/\/+$/, ''),
  email: required('RESOLVO_EMAIL'),
  password: required('RESOLVO_PASSWORD'),
  language: process.env.RESOLVO_LANG?.trim() || 'es',
  appUrl: process.env.RESOLVO_APP_URL?.trim().replace(/\/+$/, '') || null,
  timeZone:
    process.env.RESOLVO_TIMEZONE?.trim() ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'UTC',
});

const buildQuery = (query?: Query) => {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const text = params.toString();
  return text ? `?${text}` : '';
};

const errorMessage = (body: unknown, status: number) => {
  if (body && typeof body === 'object' && 'message' in body) {
    const { message } = body as { message: unknown };
    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string') return message;
  }
  return `HTTP ${status}`;
};

export class ResolvoClient {
  private token: string | null = null;

  constructor(readonly config: ResolvoConfig) {}

  get<T>(path: string, query?: Query) {
    return this.request<T>('GET', path, undefined, query);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, body ?? {});
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>('PATCH', path, body ?? {});
  }

  private async login() {
    const response = await fetch(`${this.config.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-lang': this.config.language },
      body: JSON.stringify({ email: this.config.email, password: this.config.password }),
    });
    const body = (await response.json().catch(() => null)) as { jwt?: string } | null;
    if (!response.ok || !body?.jwt)
      throw new ResolvoApiError(response.status, errorMessage(body, response.status));
    this.token = body.jwt;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Query,
    retried = false,
  ): Promise<T> {
    if (!this.token) await this.login();

    const response = await fetch(`${this.config.apiUrl}/${path}${buildQuery(query)}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'x-lang': this.config.language,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 401 && !retried) {
      this.token = null;
      return this.request<T>(method, path, body, query, true);
    }

    const payload = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) throw new ResolvoApiError(response.status, errorMessage(payload, response.status));
    return payload as T;
  }
}
