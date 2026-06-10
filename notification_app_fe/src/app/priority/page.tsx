"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { fetchNotifications } from '@/lib/api';
import type { NotificationQueryParams } from '@/lib/api/types';
import { appLogger } from '@/lib/logger';
import { rankTopNotifications } from '@/lib/priority';
import type { NotificationType } from '@/lib/api/types';
import type { PrioritizedNotification } from '@/lib/priority';
import { NotificationCard } from '@/components/NotificationCard';
import '@/components/notification-card.css';

export default function PriorityInboxPage() {
  const [token, setToken] = useState('');
  const [topN, setTopN] = useState(10);
  const [filterType, setFilterType] = useState<'All' | NotificationType>('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prioritized, setPrioritized] = useState<PrioritizedNotification[]>([]);
  const [readMap, setReadMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('readNotifications');
      if (raw) setReadMap(JSON.parse(raw));
    } catch (err) {
      appLogger.warn('Failed to read readNotifications', { err });
    }
  }, []);

  const persistReadMap = useCallback((map: Record<string, boolean>) => {
    try {
      localStorage.setItem('readNotifications', JSON.stringify(map));
      setReadMap(map);
    } catch (err) {
      appLogger.warn('Failed to persist readNotifications', { err });
    }
  }, []);

  const toggleRead = useCallback(
    (id: string) => {
      const next = { ...(readMap ?? {}), [id]: !readMap?.[id] };
      persistReadMap(next);
    },
    [readMap, persistReadMap],
  );

  const loadPriority = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!token) {
        setError('Bearer token is required. Paste it into the token input.');
        setPrioritized([]);
        return;
      }

      const params: NotificationQueryParams = { limit: 200, page: 1 };
      if (filterType !== 'All') params.notification_type = filterType as NotificationType;

      const items = await fetchNotifications(token, params);

      const ranked = rankTopNotifications(items, topN);
      setPrioritized(ranked);
      appLogger.info('Loaded prioritized notifications', { count: ranked.length, topN, filterType });
    } catch (err) {
      appLogger.error('Failed to load prioritized notifications', err as Error, { topN, filterType });
      setError((err as Error).message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [token, topN, filterType]);

  useEffect(() => {
    // auto-refresh if token exists
    if (token) loadPriority();
  }, [token, topN, filterType, loadPriority]);

  return (
    <main className="notifications-shell">
      <h1>Priority Inbox</h1>

      <div className="controls">
        <div className="token-input">
          <input aria-label="Bearer token" placeholder="Paste Bearer token" value={token} onChange={(e) => setToken(e.target.value)} />
          <button onClick={() => loadPriority()} disabled={loading}>Refresh</button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label>
            Top:
            <select value={String(topN)} onChange={(e) => setTopN(Number(e.target.value))} style={{ marginLeft: 6 }}>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </label>

          <label>
            Type:
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as 'All' | NotificationType)} style={{ marginLeft: 6 }}>
              <option value="All">All</option>
              <option value="Event">Event</option>
              <option value="Result">Result</option>
              <option value="Placement">Placement</option>
            </select>
          </label>
        </div>
      </div>

      {error && <div role="alert" style={{ color: 'crimson' }}>{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <section className="notifications-list">
          {prioritized.map((n: PrioritizedNotification) => (
            <NotificationCard key={n.ID} notification={n} isRead={!!readMap[n.ID]} onToggleRead={toggleRead} />
          ))}
        </section>
      )}
    </main>
  );
}
