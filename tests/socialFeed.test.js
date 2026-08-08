import test from 'node:test';
import assert from 'node:assert/strict';

import { getVisiblePosts, shouldPersistSocialPost, toggleFollowRelationship } from '../src/lib/socialFeed.js';

test('getVisiblePosts keeps public posts visible to everyone', () => {
  const posts = [
    { id: 1, userId: 'me', visibility: 'public' },
    { id: 2, userId: 'other', visibility: 'private' },
    { id: 3, userId: 'friend', visibility: 'followers' },
  ];

  const visible = getVisiblePosts(posts, 'me', ['friend']);

  assert.deepEqual(visible.map((post) => post.id), [1, 3]);
});

test('toggleFollowRelationship adds or removes a follow target', () => {
  const initial = [{ id: 'friend', username: 'Friend' }];

  const added = toggleFollowRelationship(initial, { id: 'new', username: 'New' });
  assert.equal(added.length, 2);
  assert.equal(added[1].id, 'new');

  const removed = toggleFollowRelationship(added, { id: 'new', username: 'New' });
  assert.equal(removed.length, 1);
  assert.equal(removed[0].id, 'friend');
});

test('shouldPersistSocialPost uses server persistence when an auth token is present', () => {
  const result = shouldPersistSocialPost({
    user: null,
    ready: false,
    authToken: '{"token":"abc"}',
  });

  assert.equal(result, true);
});

test('shouldPersistSocialPost stays local-only for unauthenticated users', () => {
  const result = shouldPersistSocialPost({
    user: null,
    ready: true,
    authToken: '',
  });

  assert.equal(result, false);
});
