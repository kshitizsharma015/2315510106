import { NOTIFICATIONS_ENDPOINT } from './constants';
import { apiFetch } from './http';
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
  const response = await apiFetch<NotificationsResponse>(`${NOTIFICATIONS_ENDPOINT}${buildQueryString(params)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
    responseLabel: 'Notifications',
  });

  return response.notifications ?? [];
}
