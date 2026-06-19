// chapter.routes.ts
import { Router } from 'express'
import { getChapters, getChapter, buyChapter } from '../controllers/chapter.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
router.get('/manga/:slug/chapters', getChapters)
router.get('/manga/:slug/chapters/:number', authenticate, getChapter)
router.post('/buy', authenticate, buyChapter)

export default router
