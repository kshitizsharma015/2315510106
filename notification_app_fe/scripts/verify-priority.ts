import assert from 'node:assert/strict';

import { getTopPriorityNotifications, rankTopNotifications } from '../src/lib/priority';
import type { NotificationItem } from '../src/lib/api/types';

const sampleNotifications: NotificationItem[] = [
  { ID: '1', Type: 'Event', Message: 'Event A', Timestamp: '2026-06-10T10:00:00.000Z' },
  { ID: '2', Type: 'Placement', Message: 'Placement A', Timestamp: '2026-06-10T09:00:00.000Z' },
  { ID: '3', Type: 'Result', Message: 'Result A', Timestamp: '2026-06-10T11:00:00.000Z' },
  { ID: '4', Type: 'Placement', Message: 'Placement B', Timestamp: '2026-06-10T12:00:00.000Z' },
  { ID: '5', Type: 'Event', Message: 'Event B', Timestamp: '2026-06-10T13:00:00.000Z' },
];

const ranked = rankTopNotifications(sampleNotifications, 3);

assert.equal(ranked.length, 3);
assert.equal(ranked[0].ID, '4');
assert.equal(ranked[1].ID, '2');
assert.equal(ranked[2].ID, '3');

const topTwo = getTopPriorityNotifications(sampleNotifications, 2);

assert.deepEqual(
  topTwo.map((notification) => notification.ID),
  ['4', '2'],
);

console.log('priority ranking harness passed');
