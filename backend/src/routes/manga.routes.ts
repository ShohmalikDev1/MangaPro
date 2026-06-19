import { Router } from 'express'
import { getMangas, getFeatured, getTrending, getManga, createManga, getSimilar, toggleLike, getTopTranslators } from '../controllers/manga.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()
router.get('/', getMangas)
router.get('/featured', getFeatured)
router.get('/trending', getTrending)
router.get('/top-translators', getTopTranslators)
router.get('/:slug', getManga)
router.get('/:slug/similar', getSimilar)
router.post('/', authenticate, requireRole('TRANSLATOR', 'ADMIN'), createManga)
router.post('/:slug/like', authenticate, toggleLike)

export default router
