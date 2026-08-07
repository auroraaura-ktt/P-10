import { Router } from 'express'

import { createPageAccount, loginUser, registerUser, resendVerificationCode, verifyUser } from '../controllers/authController.js'
import { getPageRecordBySlug, getPageRecordByOwner, listPageRecords } from '../utils/pagePersistence.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    message: 'MiitVerse Auth routes',
    routes: ['/api/auth/register', '/api/auth/login', '/api/auth/verify', '/api/auth/verify/resend'],
  })
})

router.post('/register', registerUser)
router.get('/pages', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const pages = await listPageRecords()
    res.json({ pages })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load pages' })
  }
})
router.get('/pages/owner/:ownerId', authMiddleware, async (req, res) => {
  try {
    const page = await getPageRecordByOwner(req.params.ownerId)
    if (!page) {
      return res.status(404).json({ message: 'Page not found' })
    }

    res.json({ page })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load page' })
  }
})
router.get('/pages/:slug', authMiddleware, async (req, res) => {
  try {
    const page = await getPageRecordBySlug(req.params.slug)
    if (!page) {
      return res.status(404).json({ message: 'Page not found' })
    }

    res.json({ page })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load page' })
  }
})
router.post('/create-page-account', authMiddleware, requireRole('admin'), createPageAccount)
router.post('/login', loginUser)
router.post('/verify', verifyUser)
router.post('/verify/resend', resendVerificationCode)

export default router