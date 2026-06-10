import { fetchAuthToken } from '@/lib/api';
import { appLogger } from '@/lib/logger';
import type { AuthCredentials } from '@/lib/api/types';

interface CachedToken {
  token: string;
  expiresAt?: number;
}

let credentials: AuthCredentials | null = null;
let cached: CachedToken | null = null;
let inflight: Promise<string> | null = null;

export function setCredentials(creds: AuthCredentials | null) {
  credentials = creds;
  // reset cached token when credentials change
  cached = null;
}

export function getCredentials(): AuthCredentials | null {
  return credentials;
}

async function fetchAndCache(): Promise<string> {
  if (!credentials) throw new Error('No credentials configured');

  const resp = await fetchAuthToken(credentials);
  const token = resp.token;

  // attempt to parse expiry from token if JWT, otherwise default to 5 minutes
  let expiresAt: number | undefined = undefined;
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      if (payload && typeof payload.exp === 'number') {
        expiresAt = payload.exp * 1000;
      }
    }
  } catch {
    // ignore
  }

  if (!expiresAt) {
    expiresAt = Date.now() + 1000 * 60 * 5; // 5 minutes
  }

  cached = { token, expiresAt };
  return token;
}

export async function getToken(): Promise<string> {
  if (cached && cached.token && cached.expiresAt && Date.now() < cached.expiresAt - 5000) {
    return cached.token;
  }

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const token = await fetchAndCache();
      return token;
    } finally {
      inflight = null;
    }
  })();

  try {
    return await inflight;
  } catch (err) {
    appLogger.error('TokenManager failed to fetch token', err as Error);
    throw err;
  }
}

export function clearTokenCache() {
  cached = null;
}
