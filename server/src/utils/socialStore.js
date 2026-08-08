import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', '..', 'data');
const postsFile = resolve(dataDir, 'social-posts.json');
const followsFile = resolve(dataDir, 'social-follows.json');
const uploadsDir = resolve(dataDir, 'uploads');

function ensureDataStore() {
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(uploadsDir, { recursive: true });
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

export function listAllSocialPosts() {
  return readJson(postsFile, []);
}

export function listSocialPostsByUserId(userId) {
  if (!userId) return [];
  const posts = readJson(postsFile, []);
  return (posts || []).filter((p) => p && (p.userId === userId || p.userId === String(userId)));
}

export function deleteSocialPostById(postId) {
  if (!postId) return false;
  const posts = readJson(postsFile, []);
  const updated = (posts || []).filter((p) => p && String(p.id) !== String(postId));
  writeJson(postsFile, updated);
  return true;
}

export function updateSocialPostById(postId, patch = {}) {
  if (!postId) return null;
  const posts = readJson(postsFile, []);
  let changed = null;
  const updated = (posts || []).map((p) => {
    if (!p || String(p.id) !== String(postId)) return p;
    const next = { ...p, ...patch };
    changed = next;
    return next;
  });
  writeJson(postsFile, updated);
  return changed;
}

export function createSocialPost(post) {
  const posts = readJson(postsFile, []);
  let imagePath = null;

  if (post.imageFile) {
    const fileName = `${Date.now()}-${post.imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const destination = resolve(uploadsDir, fileName);
    copyFileSync(post.imageFile.path, destination);
    imagePath = `/api/social/uploads/${fileName}`;
  }

  const nextPost = {
    id: post.id || `post-${Date.now()}`,
    userId: post.userId || 'guest',
    username: post.username || 'MiitVerse member',
    content: post.content || '',
    image: post.image || imagePath || null,
    createdAt: post.createdAt || new Date().toISOString(),
    likes: Number(post.likes || 0),
    likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
    comments: Array.isArray(post.comments) ? post.comments : [],
    reposts: Number(post.reposts || 0),
    visibility: post.visibility || 'public',
  };

  const nextPosts = [nextPost, ...posts];
  writeJson(postsFile, nextPosts);
  return nextPost;
}

export function toggleSocialPostLike(postId, account) {
  if (!postId || !account?.id) return null

  const posts = readJson(postsFile, [])
  let result = null
  const updated = posts.map((post) => {
    if (!post || String(post.id) !== String(postId)) return post

    const likedBy = Array.isArray(post.likedBy) ? post.likedBy : []
    const existingIndex = likedBy.findIndex((entry) => String(entry?.userId) === String(account.id))
    const nextLikedBy = existingIndex >= 0
      ? likedBy.filter((_, index) => index !== existingIndex)
      : [...likedBy, { userId: String(account.id), username: account.username || 'MiitVerse member' }]
    const legacyLikes = Math.max(Number(post.likes || 0), likedBy.length)
    const nextPost = {
      ...post,
      likedBy: nextLikedBy,
      likes: existingIndex >= 0 ? Math.max(0, legacyLikes - 1) : legacyLikes + 1,
    }

    result = { post: nextPost, reacted: existingIndex < 0 }
    return nextPost
  })

  if (!result) return null
  writeJson(postsFile, updated)
  return result
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
