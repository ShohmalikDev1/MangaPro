import { Router } from 'express'
import { getRatings, createRating } from '../controllers/rating.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
router.get('/manga/:slug/ratings', getRatings)
router.post('/manga/:slug/ratings', authenticate, createRating)

export default router
