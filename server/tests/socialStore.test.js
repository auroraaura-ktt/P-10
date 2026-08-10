import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyUserPostWeightedShuffle,
  createSocialPost,
  deleteSocialPostById,
  getVisiblePosts,
  listAllSocialPosts,
  shuffleUserPostsByReactions,
  toggleFollowRelationship,
} from '../src/utils/socialStore.js';

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

test('createSocialPost persists an image URL in the shared post store', () => {
  const created = createSocialPost({
    userId: 'tester',
    username: 'Tester',
    content: 'Image post',
    image: '/api/social/uploads/demo.png',
  });

  const posts = listAllSocialPosts();
  const saved = posts.find((post) => post.id === created.id);

  assert.ok(saved);
  assert.equal(saved.image, '/api/social/uploads/demo.png');

  deleteSocialPostById(created.id);
});

test('server weighted shuffle prioritizes higher-reaction user posts without removing randomness', () => {
  const posts = [
    { id: 'low', likes: 1 },
    { id: 'high', likes: 75 },
    { id: 'middle', likes: 25 },
  ];

  const priorityOrder = shuffleUserPostsByReactions(posts, () => 0.5);
  assert.deepEqual(priorityOrder.map((post) => post.id), ['high', 'middle', 'low']);

  const randomValues = [0.95, 0.2, 0.6];
  const randomOrder = shuffleUserPostsByReactions(posts, () => randomValues.shift());
  assert.notDeepEqual(randomOrder.map((post) => post.id), ['high', 'middle', 'low']);
});

test('server weighted shuffle leaves page reserved slots untouched in mixed feeds', () => {
  const posts = [
    { id: 'user-low', userId: 'user-1', likes: 0 },
    { id: 'page-a', userId: 'page-1', likes: 1000 },
    { id: 'user-high', userId: 'user-2', likes: 100 },
    { id: 'page-b', userId: 'page-2', likes: 1000 },
    { id: 'user-middle', userId: 'user-3', likes: 25 },
  ];

  const shuffled = applyUserPostWeightedShuffle(posts, {
    pagePostUserIds: ['page-1', 'page-2'],
    random: () => 0.5,
  });

  assert.deepEqual(shuffled.map((post) => post.id), [
    'user-high',
    'page-a',
    'user-middle',
    'page-b',
    'user-low',
  ]);
});
