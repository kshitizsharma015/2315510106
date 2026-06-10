export type NotificationType = 'Event' | 'Result' | 'Placement';

export interface NotificationItem {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
}

export interface AuthCredentials {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

export interface AuthTokenResponse {
  token: string;
  raw: unknown;
}

export interface NotificationQueryParams {
  limit?: number;
  page?: number;
  notification_type?: NotificationType;
}
