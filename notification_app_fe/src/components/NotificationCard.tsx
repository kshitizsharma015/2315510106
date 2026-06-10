"use client";

import React from 'react';
import { appLogger } from '@/lib/logger';
import type { NotificationItem } from '@/lib/api/types';
import './notification-card.css';

interface Props {
  notification: NotificationItem;
  isRead: boolean;
  onToggleRead(id: string): void;
}

export function NotificationCard({ notification, isRead, onToggleRead }: Props) {
  const handleToggle = () => {
    try {
      onToggleRead(notification.ID);
      appLogger.info('Toggled read state', { id: notification.ID, isRead: !isRead });
    } catch (err) {
      appLogger.error('Failed to toggle read state', err, { id: notification.ID });
    }
  };

  return (
    <article className={`notification-card ${isRead ? 'read' : 'unread'}`} aria-live="polite">
      <header className="nc-header">
        <span className="nc-type">{notification.Type}</span>
        <time className="nc-time">{new Date(notification.Timestamp).toLocaleString()}</time>
      </header>

      <p className="nc-message">{notification.Message}</p>

      <div className="nc-actions">
        <button className="nc-btn" onClick={handleToggle} aria-pressed={isRead}>
          {isRead ? 'Mark unread' : 'Mark read'}
        </button>
      </div>
    </article>
  );
}
