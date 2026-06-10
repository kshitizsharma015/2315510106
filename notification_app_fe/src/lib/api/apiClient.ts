import { appLogger } from '@/lib/logger';
import { getToken, getCredentials } from '@/lib/auth/tokenManager';

interface ClientOptions extends RequestInit {
  responseLabel?: string;
  useAuthFromManager?: boolean; // if true and no Authorization header provided, attempts to use TokenManager
}

async function readBody(res: Response) {
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function clientFetch<T>(url: string, opts: ClientOptions = {}): Promise<T> {
  const headers = new Headers(opts.headers as HeadersInit);

  if (!headers.has('Authorization') && opts.useAuthFromManager) {
    try {
      // prefer explicit credentials; if not present, TokenManager will throw
      const token = await getToken();
      headers.set('Authorization', `Bearer ${token}`);
    } catch (err) {
      appLogger.warn('apiClient: unable to attach token from TokenManager', { hasCredentials: !!getCredentials(), reason: (err as Error).message ?? String(err) });
    }
  }

  const response = await fetch(url, { ...opts, headers });

  if (!response.ok) {
    const body = await readBody(response);
    appLogger.error(`${opts.responseLabel ?? 'API'} request failed`, undefined, { url, status: response.status, body });
    throw new Error(`${opts.responseLabel ?? 'API'} request failed with status ${response.status}`);
  }

  return (await readBody(response)) as T;
}

export async function clientGet<T>(url: string, opts?: ClientOptions) {
  return clientFetch<T>(url, { method: 'GET', ...opts });
}

export async function clientPost<T>(url: string, body?: unknown, opts?: ClientOptions) {
  return clientFetch<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) },
    ...opts,
  });
}
