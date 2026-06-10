export { AUTH_ENDPOINT, API_BASE_URL, NOTIFICATIONS_ENDPOINT } from './constants';
export { fetchAuthToken } from './auth';
export { fetchNotifications } from './notifications';
export type {
  AuthCredentials,
  AuthTokenResponse,
  NotificationItem,
  NotificationQueryParams,
  NotificationType,
  NotificationsResponse,
} from './types';

export { setCredentials as setAuthCredentials, getToken as getAuthToken } from '@/lib/auth/tokenManager';
export { clientGet, clientPost } from './apiClient';
