import { NOTIFICATIONS_ENDPOINT } from './constants';
import { apiFetch } from './http';
import { clientGet } from './apiClient';
import type {
  NotificationItem,
  NotificationQueryParams,
  NotificationsResponse,
} from './types';

function buildQueryString(params: NotificationQueryParams = {}): string {
  const searchParams = new URLSearchParams();

  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }

  if (typeof params.page === 'number') {
    searchParams.set('page', String(params.page));
  }

  if (params.notification_type) {
    searchParams.set('notification_type', params.notification_type);
  }

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

export async function fetchNotifications(
  bearerToken: string,
  params: NotificationQueryParams = {},
): Promise<NotificationItem[]> {
  const url = `${NOTIFICATIONS_ENDPOINT}${buildQueryString(params)}`;

  if (bearerToken) {
    const response = await apiFetch<NotificationsResponse>(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      responseLabel: 'Notifications',
    });

    return response.notifications ?? [];
  }

  // when no bearer token provided, attempt to use the apiClient which can use TokenManager
  const response = await clientGet<NotificationsResponse>(url, { responseLabel: 'Notifications', useAuthFromManager: true });
  return response.notifications ?? [];
}
