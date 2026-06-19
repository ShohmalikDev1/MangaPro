import { Router } from 'express'
import { requestPurchase, approvePurchase, rejectPurchase, getTransactions, getPendingTransactions } from '../controllers/coin.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()
router.post('/request', authenticate, requestPurchase)
router.get('/transactions', authenticate, getTransactions)
router.get('/pending', authenticate, requireRole('ADMIN'), getPendingTransactions)
router.put('/approve/:txnId', authenticate, requireRole('ADMIN'), approvePurchase)
router.put('/reject/:txnId', authenticate, requireRole('ADMIN'), rejectPurchase)

export default router
