import { Router, Response } from 'express'
import { authenticate, requireRole } from '../middleware/auth.middleware'
import prisma from '../utils/prisma'

const router = Router()
const adminOnly = [authenticate, requireRole('ADMIN')]

// Dashboard stats
router.get('/stats', ...adminOnly, async (req: any, res: Response) => {
  try {
    const [users, mangas, chapters, pendingTxns] = await Promise.all([
      prisma.user.count(),
      prisma.manga.count(),
      prisma.chapter.count(),
      prisma.coinTransaction.count({ where: { status: 'PENDING' } })
    ])
    res.json({ users, mangas, chapters, pendingTxns })
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
})

// Get all users
router.get('/users', ...adminOnly, async (req: any, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, email: true, role: true, coins: true, createdAt: true }
    })
    res.json(users)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
})

// Update user role
router.put('/users/:id/role', ...adminOnly, async (req: any, res: Response) => {
  try {
    const { role } = req.body
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role }
    })
    res.json(user)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
})

// Get all mangas
router.get('/mangas', ...adminOnly, async (req: any, res: Response) => {
  try {
    const mangas = await prisma.manga.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        translator: { select: { id: true, username: true } },
        _count: { select: { chapters: true } }
      }
    })
    res.json(mangas)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
})

// Delete manga
router.delete('/mangas/:id', ...adminOnly, async (req: any, res: Response) => {
  try {
    await prisma.manga.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
})

export default router
