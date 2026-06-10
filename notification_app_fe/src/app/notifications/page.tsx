"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { fetchNotifications, fetchAuthToken, setAuthCredentials } from '@/lib/api';
import type { AuthCredentials } from '@/lib/api/types';
import { appLogger } from '@/lib/logger';
import type { NotificationItem } from '@/lib/api/types';
import { NotificationCard } from '@/components/NotificationCard';
import { PaginationControls } from '@/components/PaginationControls';
import '@/components/notification-card.css';

export default function NotificationsPage() {
  const [token, setToken] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [readMap, setReadMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('readNotifications');
      if (raw) setReadMap(JSON.parse(raw));
    } catch (err) {
      appLogger.warn('Failed to read readNotifications from localStorage', { err });
    }
  }, []);

  const [showCreds, setShowCreds] = useState(false);
  const [creds, setCreds] = useState<AuthCredentials>({
    email: '',
    name: '',
    rollNo: '',
    accessCode: '',
    clientID: '',
    clientSecret: '',
  });

  const fetchTokenFromServer = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetchAuthToken(creds);
      setToken(resp.token);
      // also set credentials into TokenManager so other pages can use it
      setAuthCredentials(creds);
      appLogger.info('Fetched token from server and set credentials');
    } catch (err) {
      appLogger.error('Failed to fetch token from server', err as Error);
      setError((err as Error).message ?? 'Failed to fetch token');
    } finally {
      setLoading(false);
    }
  }, [creds]);

  const persistReadMap = useCallback((map: Record<string, boolean>) => {
    try {
      localStorage.setItem('readNotifications', JSON.stringify(map));
    } catch (err) {
      appLogger.warn('Failed to persist readNotifications', { err });
    }
  }, []);

  const toggleRead = useCallback(
    (id: string) => {
      setReadMap((m) => {
        const next = { ...m, [id]: !m[id] };
        persistReadMap(next);
        return next;
      });
    },
    [persistReadMap],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!token) {
        setError('Bearer token is required. Paste it into the token input.');
        setNotifications([]);
        return;
      }

      const items = await fetchNotifications(token, { limit, page });
      setNotifications(items);
      appLogger.info('Fetched notifications', { count: items.length, page, limit });
    } catch (err) {
      appLogger.error('Failed to fetch notifications', err as Error, { page, limit });
      setError((err as Error).message ?? 'Unknown error');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, limit]);

  useEffect(() => {
    // do not auto-load unless token exists
    if (token) load();
  }, [token, page, limit, load]);

  return (
    <main className="notifications-shell">
      <h1>All Notifications</h1>

      <div className="controls">
        <div className="token-input">
          <input
            aria-label="Bearer token"
            placeholder="Paste Bearer token here or leave blank to fetch via credentials later"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />

          <button onClick={() => load()} disabled={loading}>
            Fetch
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setShowCreds((s) => !s)}>{showCreds ? 'Hide' : 'Use credentials'}</button>
        </div>

        <PaginationControls page={page} limit={limit} onPageChange={setPage} onLimitChange={setLimit} />
      </div>

      {showCreds && (
        <section style={{ marginBottom: 12 }} aria-label="Credentials form">
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <input placeholder="email" value={creds.email} onChange={(e) => setCreds({ ...creds, email: e.target.value })} />
            <input placeholder="name" value={creds.name} onChange={(e) => setCreds({ ...creds, name: e.target.value })} />
            <input placeholder="rollNo" value={creds.rollNo} onChange={(e) => setCreds({ ...creds, rollNo: e.target.value })} />
            <input placeholder="accessCode" value={creds.accessCode} onChange={(e) => setCreds({ ...creds, accessCode: e.target.value })} />
            <input placeholder="clientID" value={creds.clientID} onChange={(e) => setCreds({ ...creds, clientID: e.target.value })} />
            <input placeholder="clientSecret" value={creds.clientSecret} onChange={(e) => setCreds({ ...creds, clientSecret: e.target.value })} />
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => fetchTokenFromServer()} disabled={loading}>Fetch token from server</button>
          </div>
        </section>
      )}

      {error && <div role="alert" style={{ color: 'crimson' }}>{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <section className="notifications-list">
          {notifications.map((n) => (
            <NotificationCard key={n.ID} notification={n} isRead={!!readMap[n.ID]} onToggleRead={toggleRead} />
          ))}
        </section>
      )}
    </main>
  );
}
