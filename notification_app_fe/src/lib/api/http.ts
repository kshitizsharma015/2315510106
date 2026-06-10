import { appLogger } from '@/lib/logger';

interface ApiFetchOptions extends RequestInit {
  responseLabel: string;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export async function apiFetch<T>(url: string, options: ApiFetchOptions): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
  });

  if (!response.ok) {
    const body = await readResponseBody(response);

    appLogger.error(`${options.responseLabel} request failed`, undefined, {
      url,
      status: response.status,
      statusText: response.statusText,
      body,
    });

    throw new Error(`${options.responseLabel} request failed with status ${response.status}`);
  }

  return (await readResponseBody(response)) as T;
}
