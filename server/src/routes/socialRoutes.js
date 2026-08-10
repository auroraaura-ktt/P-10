import { Router } from 'express'
import multer from 'multer'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'
import {
  createSocialPost, deleteSocialPostById, getSocialAsset, getSocialFollows, listAllSocialPosts,
  listSocialPosts, listSocialPostsByUserId, saveSocialAsset, saveSocialFollows,
  toggleFollowRelationship, toggleSocialPostLike, updateSocialPostById,
} from '../utils/socialStore.js'
import { listPageRecords } from '../utils/pagePersistence.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } })

function safeFileName(file) {
  return `${Date.now()}-${file.originalname?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'upload'}`
}

async function storeUpload(file) {
  const fileName = safeFileName(file)
  return saveSocialAsset({ fileName, contentType: file.mimetype, data: file.buffer })
}

router.post('/uploads', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' })
    return res.json({ imageUrl: await storeUpload(req.file) })
  } catch (error) { next(error) }
})

router.get('/uploads/:fileName', async (req, res, next) => {
  try {
    const asset = await getSocialAsset(req.params.fileName)
    if (!asset) return res.status(404).json({ message: 'Image not found' })
    res.type(asset.contentType).send(asset.data)
  } catch (error) { next(error) }
})

router.get('/posts', authMiddleware, async (req, res, next) => {
  try {
    if (req.query?.userId) return res.json({ posts: await listSocialPostsByUserId(req.query.userId) })
    const following = await getSocialFollows(req.user.id)
    const pages = await listPageRecords()
    const pagePostUserIds = pages.map((page) => page.ownerId || page.id).filter(Boolean)
    return res.json({ posts: await listSocialPosts(req.user.id, following, { pagePostUserIds }) })
  } catch (error) { next(error) }
})

router.post('/posts', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    const image = req.file ? await storeUpload(req.file) : (typeof req.body?.image === 'string' ? req.body.image.trim() || null : null)
    const post = await createSocialPost({
      ...req.body,
      content: req.body?.content || req.body?.message || '',
      image,
      userId: req.user.id,
      username: req.body?.username || req.user.username || 'MiitVerse member',
    })
    return res.status(201).json({ post })
  } catch (error) { next(error) }
})

router.post('/posts/:id/likes', authMiddleware, async (req, res, next) => {
  try {
    const result = await toggleSocialPostLike(req.params.id, { id: req.user.id, username: req.user.username })
    if (!result) return res.status(404).json({ message: 'Post not found' })
    return res.json(result)
  } catch (error) { next(error) }
})

router.get('/posts/all', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try { return res.json({ posts: await listAllSocialPosts() }) } catch (error) { next(error) }
})
router.delete('/posts/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try { return await deleteSocialPostById(req.params.id) ? res.json({ message: 'Deleted' }) : res.status(404).json({ message: 'Post not found' }) } catch (error) { next(error) }
})
router.patch('/posts/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const post = await updateSocialPostById(req.params.id, req.body || {})
    return post ? res.json({ post }) : res.status(404).json({ message: 'Post not found' })
  } catch (error) { next(error) }
})

router.get('/follows', authMiddleware, async (req, res, next) => {
  try { return res.json({ following: await getSocialFollows(req.user.id) }) } catch (error) { next(error) }
})
router.post('/follows', authMiddleware, async (req, res, next) => {
  try {
    const current = await getSocialFollows(req.user.id)
    const following = await saveSocialFollows(req.user.id, toggleFollowRelationship(current, req.body?.targetUser))
    return res.json({ following })
  } catch (error) { next(error) }
})

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) return res.status(413).json({ message: 'Upload must be 15 MB or smaller' })
  console.error('Social persistence failed:', error.message)
  return res.status(503).json({ message: 'Data service unavailable. No changes were saved.' })
})

export default router
