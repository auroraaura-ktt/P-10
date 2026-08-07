import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', '..', 'data');
const postsFile = resolve(dataDir, 'social-posts.json');
const followsFile = resolve(dataDir, 'social-follows.json');

function ensureDataStore() {
  mkdirSync(dataDir, { recursive: true });
}

function readJson(filePath, fallbackValue) {
  if (!existsSync(filePath)) return fallbackValue;

  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return fallbackValue;
  }
}

function writeJson(filePath, value) {
  ensureDataStore();
  writeFileSync(filePath, JSON.stringify(value, null, 2));
}

export function getVisiblePosts(posts = [], currentUserId = null, following = []) {
  const followingIds = new Set((following || []).map((entry) => entry?.id ?? entry));

  return (posts || []).filter((post) => {
    if (!post) return false;
    if (post.visibility === 'public') return true;
    if (!currentUserId) return false;
    if (post.userId === currentUserId) return true;
    if (post.visibility === 'followers' && followingIds.has(post.userId)) return true;
    return false;
  });
}

export function toggleFollowRelationship(currentFollowing = [], targetUser = null) {
  if (!targetUser) return currentFollowing;

  const targetId = targetUser.id ?? targetUser.userId ?? targetUser.username;
  if (!targetId) return currentFollowing;

  const exists = currentFollowing.some((entry) => (entry?.id ?? entry?.userId ?? entry?.username) === targetId);

  if (exists) {
    return currentFollowing.filter((entry) => (entry?.id ?? entry?.userId ?? entry?.username) !== targetId);
  }

  return [...currentFollowing, { id: targetId, username: targetUser.username || 'User' }];
}

export function listSocialPosts(currentUserId = null, following = []) {
  const posts = readJson(postsFile, []);
  return getVisiblePosts(posts, currentUserId, following);
}

export function createSocialPost(post) {
  const posts = readJson(postsFile, []);
  const nextPost = {
    id: post.id || `post-${Date.now()}`,
    userId: post.userId || 'guest',
    username: post.username || 'MiitVerse member',
    content: post.content || '',
    image: post.image || null,
    createdAt: post.createdAt || new Date().toISOString(),
    likes: Number(post.likes || 0),
    comments: Array.isArray(post.comments) ? post.comments : [],
    reposts: Number(post.reposts || 0),
    visibility: post.visibility || 'public',
  };

  const nextPosts = [nextPost, ...posts];
  writeJson(postsFile, nextPosts);
  return nextPost;
}

export function getSocialFollows(userId) {
  const follows = readJson(followsFile, {});
  return follows[userId] || [];
}

export function saveSocialFollows(userId, following) {
  const follows = readJson(followsFile, {});
  follows[userId] = following;
  writeJson(followsFile, follows);
  return following;
}
