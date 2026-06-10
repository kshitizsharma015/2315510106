import type { NotificationItem, NotificationType } from './api/types';

const PRIORITY_WEIGHT: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export interface PrioritizedNotification extends NotificationItem {
  priorityScore: number;
}

function getNotificationTypeWeight(type: string): number {
  return PRIORITY_WEIGHT[type as NotificationType] ?? 0;
}

function getTimestampWeight(timestamp: string): number {
  const parsedTime = Date.parse(timestamp);

  if (Number.isNaN(parsedTime)) {
    return 0;
  }

  return parsedTime;
}

function compareNotifications(left: PrioritizedNotification, right: PrioritizedNotification): number {
  if (left.priorityScore !== right.priorityScore) {
    return right.priorityScore - left.priorityScore;
  }

  const timestampDiff = getTimestampWeight(right.Timestamp) - getTimestampWeight(left.Timestamp);

  if (timestampDiff !== 0) {
    return timestampDiff;
  }

  return right.ID.localeCompare(left.ID);
}

export function scoreNotification(notification: NotificationItem): PrioritizedNotification {
  const typeWeight = getNotificationTypeWeight(notification.Type);
  const recencyWeight = getTimestampWeight(notification.Timestamp);

  return {
    ...notification,
    priorityScore: typeWeight * 1_000_000_000_000 + recencyWeight,
  };
}

export function rankTopNotifications(notifications: NotificationItem[], limit = 10): PrioritizedNotification[] {
  if (limit <= 0) {
    return [];
  }

  const ranked = notifications.map(scoreNotification);

  if (ranked.length <= limit) {
    return ranked.sort(compareNotifications);
  }

  const topNotifications: PrioritizedNotification[] = [];

  for (const notification of ranked) {
    if (topNotifications.length < limit) {
      topNotifications.push(notification);
      topNotifications.sort(compareNotifications);
      continue;
    }

    const lowestRankedNotification = topNotifications[topNotifications.length - 1];

    if (compareNotifications(notification, lowestRankedNotification) >= 0) {
      continue;
    }

    topNotifications[topNotifications.length - 1] = notification;
    topNotifications.sort(compareNotifications);
  }

  return topNotifications;
}

export function getTopPriorityNotifications(notifications: NotificationItem[], limit = 10): NotificationItem[] {
  return rankTopNotifications(notifications, limit);
}
