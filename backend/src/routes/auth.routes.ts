import { Router } from 'express'
import { register, login, googleAuth, refreshToken, getMe, forgotPassword, resetPassword } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
router.post('/register', register)
router.post('/login', login)
router.post('/google', googleAuth)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/refresh', refreshToken)
router.get('/me', authenticate, getMe)

export default router
