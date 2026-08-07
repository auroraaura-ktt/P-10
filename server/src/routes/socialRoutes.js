import { Router } from 'express';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { createSocialPost, getSocialFollows, listSocialPosts, saveSocialFollows } from '../utils/socialStore.js';

const router = Router();

router.get('/posts', authMiddleware, (req, res) => {
  const following = getSocialFollows(req.user.id);
  const posts = listSocialPosts(req.user.id, following);
  res.json({ posts });
});

router.post('/posts', authMiddleware, (req, res) => {
  const post = createSocialPost({
    ...req.body,
    userId: req.user.id,
    username: req.user.username || 'MiitVerse member',
  });

  res.status(201).json({ post });
});

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
