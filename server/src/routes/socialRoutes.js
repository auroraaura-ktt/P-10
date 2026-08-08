import { Router } from 'express';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  createSocialPost,
  getSocialFollows,
  listSocialPosts,
  saveSocialFollows,
  listAllSocialPosts,
  deleteSocialPostById,
  updateSocialPostById,
  listSocialPostsByUserId,
} from '../utils/socialStore.js';

const router = Router();

router.get('/posts', authMiddleware, (req, res) => {
  const { userId } = req.query || {}
  if (userId) {
    const posts = listSocialPostsByUserId(userId)
    return res.json({ posts })
  }

  const following = getSocialFollows(req.user.id);
  const posts = listSocialPosts(req.user.id, following);
  res.json({ posts });
});

router.post('/posts', authMiddleware, (req, res) => {
  const displayName = req.body?.username || req.user?.username || req.body?.user?.username || 'MiitVerse member';

  const post = createSocialPost({
    ...req.body,
    userId: req.user.id,
    username: displayName,
    suspended: false,
  });

  res.status(201).json({ post });
});

// Admin: list all posts
router.get('/posts/all', authMiddleware, requireRole('admin'), (req, res) => {
  const posts = listAllSocialPosts()
  res.json({ posts })
})

// Admin: delete a post by id
router.delete('/posts/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params || {}
  const ok = deleteSocialPostById(id)
  if (!ok) return res.status(404).json({ message: 'Post not found' })
  res.json({ message: 'Deleted' })
})

// Admin: update a post (e.g., suspend/unsuspend)
router.patch('/posts/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params || {}
  const patch = req.body || {}
  const updated = updateSocialPostById(id, patch)
  if (!updated) return res.status(404).json({ message: 'Post not found' })
  res.json({ post: updated })
})

router.get('/follows', authMiddleware, (req, res) => {
  res.json({ following: getSocialFollows(req.user.id) });
});

router.post('/follows', authMiddleware, (req, res) => {
  const { targetUser } = req.body || {};
  const currentFollowing = getSocialFollows(req.user.id);
  const nextFollowing = currentFollowing.some((entry) => (entry?.id ?? entry?.userId ?? entry?.username) === (targetUser?.id ?? targetUser?.userId ?? targetUser?.username))
    ? currentFollowing.filter((entry) => (entry?.id ?? entry?.userId ?? entry?.username) !== (targetUser?.id ?? targetUser?.userId ?? targetUser?.username))
    : [...currentFollowing, { id: targetUser?.id ?? targetUser?.userId ?? targetUser?.username, username: targetUser?.username || 'User' }];

  saveSocialFollows(req.user.id, nextFollowing);
  res.json({ following: nextFollowing });
});

export default router;
