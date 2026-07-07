import { Router } from 'express'

import { createPageAccount, loginUser, registerUser, resendVerificationCode, verifyUser } from '../controllers/authController.js'
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
router.post('/create-page-account', authMiddleware, requireRole('admin'), createPageAccount)
router.post('/login', loginUser)
router.post('/verify', verifyUser)
router.post('/verify/resend', resendVerificationCode)

export default router