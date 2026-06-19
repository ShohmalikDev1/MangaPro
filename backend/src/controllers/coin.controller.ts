import { Request, Response } from 'express'
import prisma from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

// Request coin purchase (via Telegram bot)
export const requestPurchase = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, proofImg } = req.body
    if (!amount || !proofImg) {
      return res.status(400).json({ error: 'Summa va to\'lov rasmi talab qilinadi' })
    }

    const validAmounts = [100, 500, 1000]
    if (!validAmounts.includes(amount)) {
      return res.status(400).json({ error: 'Noto\'g\'ri summa' })
    }

    const txn = await prisma.coinTransaction.create({
      data: {
        userId: req.user!.id,
        amount,
        type: 'PURCHASE',
        status: 'PENDING',
        proofImg
      }
    })

    // Notify admin
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        type: 'COIN_ADDED',
        title: 'Yangi to\'lov so\'rovi',
        body: `${req.user!.id} foydalanuvchi ${amount} tanga so\'radi`,
        link: `/admin/payments/${txn.id}`
      }
    })

    res.json({ success: true, txnId: txn.id, message: 'So\'rov yuborildi. Admin tasdiqlashidan so\'ng tangalar qo\'shiladi.' })
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

// Approve purchase (Admin only)
export const approvePurchase = async (req: AuthRequest, res: Response) => {
  try {
    const { txnId } = req.params

    const txn = await prisma.coinTransaction.findUnique({ where: { id: txnId } })
    if (!txn) return res.status(404).json({ error: 'To\'lov topilmadi' })
    if (txn.status !== 'PENDING') return res.status(400).json({ error: 'Bu to\'lov allaqachon ko\'rib chiqilgan' })

    // Bonus: 1000 tanga = +100 bonus
    const bonus = txn.amount === 1000 ? 100 : txn.amount === 500 ? 0 : 0
    const totalCoins = txn.amount + bonus

    await prisma.$transaction([
      prisma.coinTransaction.update({
        where: { id: txnId },
        data: { status: 'APPROVED' }
      }),
      prisma.user.update({
        where: { id: txn.userId },
        data: { coins: { increment: totalCoins } }
      }),
      ...(bonus > 0 ? [prisma.coinTransaction.create({
        data: {
          userId: txn.userId,
          amount: bonus,
          type: 'BONUS',
          status: 'APPROVED'
        }
      })] : []),
      prisma.notification.create({
        data: {
          userId: txn.userId,
          type: 'COIN_ADDED',
          title: 'Tangalar qo\'shildi! 🪙',
          body: `Hisobingizga ${totalCoins} tanga qo\'shildi${bonus > 0 ? ` (${bonus} ta bonus bilan)` : ''}`
        }
      })
    ])

    res.json({ success: true, message: `${totalCoins} tanga qo'shildi` })
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

// Reject purchase (Admin only)
export const rejectPurchase = async (req: AuthRequest, res: Response) => {
  try {
    const { txnId } = req.params
    const { reason } = req.body

    const txn = await prisma.coinTransaction.findUnique({ where: { id: txnId } })
    if (!txn) return res.status(404).json({ error: 'To\'lov topilmadi' })

    await prisma.$transaction([
      prisma.coinTransaction.update({
        where: { id: txnId },
        data: { status: 'REJECTED', adminNote: reason }
      }),
      prisma.notification.create({
        data: {
          userId: txn.userId,
          type: 'COIN_ADDED',
          title: 'To\'lov rad etildi',
          body: reason || 'To\'lovingiz tasdiqlanmadi. Iltimos admin bilan bog\'laning.'
        }
      })
    ])

    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

// Get user transactions
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const txns = await prisma.coinTransaction.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    res.json(txns)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

// Get pending transactions (Admin)
export const getPendingTransactions = async (req: Request, res: Response) => {
  try {
    const txns = await prisma.coinTransaction.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true, email: true } } }
    })
    res.json(txns)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}
