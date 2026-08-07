import test from 'node:test';
import assert from 'node:assert/strict';

import { getVisiblePosts, toggleFollowRelationship } from '../src/utils/socialStore.js';

test('server-side visibility logic keeps public posts visible and followers-only posts gated', () => {
  const posts = [
    { id: 'p1', userId: 'me', visibility: 'public' },
    { id: 'p2', userId: 'friend', visibility: 'followers' },
    { id: 'p3', userId: 'other', visibility: 'private' },
  ];

  const visible = getVisiblePosts(posts, 'me', ['friend']);
  assert.deepEqual(visible.map((post) => post.id), ['p1', 'p2']);
});

test('server-side follow toggling adds and removes exact targets', () => {
  const initial = [{ id: 'friend', username: 'Friend' }];
  const added = toggleFollowRelationship(initial, { id: 'new', username: 'New' });
  assert.equal(added.length, 2);
  assert.equal(added[1].id, 'new');

  const removed = toggleFollowRelationship(added, { id: 'new', username: 'New' });
  assert.equal(removed.length, 1);
  assert.equal(removed[0].id, 'friend');
});
