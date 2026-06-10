import { AUTH_ENDPOINT } from './constants';
import { apiFetch } from './http';
import type { AuthCredentials, AuthTokenResponse } from './types';

type AuthResponseBody =
  | string
  | {
      token?: string;
      accessToken?: string;
      data?: {
        token?: string;
        accessToken?: string;
      };
      [key: string]: unknown;
    };

function extractToken(body: AuthResponseBody): string {
  if (typeof body === 'string') {
    return body;
  }

  const nestedToken = body.data?.token ?? body.data?.accessToken;
  const directToken = body.token ?? body.accessToken;
  const token = nestedToken ?? directToken;

  if (typeof token === 'string' && token.trim().length > 0) {
    return token;
  }

  throw new Error('Unable to determine the bearer token from the auth response');
}

export async function fetchAuthToken(credentials: AuthCredentials): Promise<AuthTokenResponse> {
  const body = await apiFetch<AuthResponseBody>(AUTH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    responseLabel: 'Auth token',
  });

  const token = extractToken(body);

  return {
    token,
    raw: body,
  };
}
