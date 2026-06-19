import { Router } from 'express'
import { getComments, createComment, deleteComment, likeComment } from '../controllers/comment.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
router.get('/manga/:slug/comments', getComments)
router.post('/manga/:slug/comments', authenticate, createComment)
router.delete('/:id', authenticate, deleteComment)
router.post('/:id/like', authenticate, likeComment)

export default router
