import { Router } from 'express'

import { deleteUser, getCurrentUser, listUsers, resetPassword, setUserSuspension, updateCurrentUser, updateCurrentPassword } from '../controllers/userController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = Router()

router.get('/me', authMiddleware, getCurrentUser)
router.patch('/me', authMiddleware, updateCurrentUser)
router.patch('/me/password', authMiddleware, updateCurrentPassword)
router.get('/', authMiddleware, requireRole('admin', 'moderator'), listUsers)
router.post('/reset-password', authMiddleware, requireRole('admin'), resetPassword)
router.patch('/:id/suspension', authMiddleware, requireRole('admin'), setUserSuspension)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteUser)

export default router
