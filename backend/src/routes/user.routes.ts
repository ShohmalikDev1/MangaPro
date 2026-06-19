import { Router } from 'express'
import { getProfile, getBookmarks, updateBookmark, getReadHistory, getNotifications, markNotificationsRead, getTopReaders } from '../controllers/user.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
router.get('/top-readers', getTopReaders)
router.get('/:id', getProfile)
router.get('/me/bookmarks', authenticate, getBookmarks)
router.post('/me/bookmarks', authenticate, updateBookmark)
router.get('/me/history', authenticate, getReadHistory)
router.get('/me/notifications', authenticate, getNotifications)
router.post('/me/notifications/read', authenticate, markNotificationsRead)

export default router
