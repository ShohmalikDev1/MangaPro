import { Request, Response } from 'express'
import prisma from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, username: true, avatar: true, role: true, createdAt: true,
        _count: { select: { translations: true } }
      }
    })
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })

    if (user.role === 'TRANSLATOR') {
      const mangas = await prisma.manga.findMany({
        where: { translatorId: id },
        include: { _count: { select: { chapters: true } } }
      })
      return res.json({ ...user, mangas })
    }

    res.json(user)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

export const getBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query
    const where: any = { userId: req.user!.id }
    if (status) where.status = status

    const bookmarks = await prisma.bookmark.findMany({
      where,
      include: {
        manga: {
          include: { _count: { select: { chapters: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(bookmarks)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

export const updateBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const { mangaId, status } = req.body
    const bookmark = await prisma.bookmark.upsert({
      where: { userId_mangaId: { userId: req.user!.id, mangaId } },
      update: { status },
      create: { userId: req.user!.id, mangaId, status }
    })
    res.json(bookmark)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

export const getReadHistory = async (req: AuthRequest, res: Response) => {
  try {
    const history = await prisma.readHistory.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: {
        manga: { select: { id: true, title: true, slug: true, cover: true } },
        chapter: { select: { number: true, title: true } }
      }
    })
    res.json(history)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    const unread = await prisma.notification.count({
      where: { userId: req.user!.id, isRead: false }
    })
    res.json({ notifications, unread })
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

export const markNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true }
    })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

export const getTopReaders = async (req: Request, res: Response) => {
  try {
    const readers = await prisma.user.findMany({
      where: { role: 'READER' },
      take: 4,
      include: { _count: { select: { readHistory: true, comments: true } } },
      orderBy: { createdAt: 'asc' }
    })
    res.json(readers.map(r => ({
      id: r.id,
      username: r.username,
      avatar: r.avatar,
      xp: r._count.readHistory * 10 + r._count.comments * 5
    })).sort((a, b) => b.xp - a.xp))
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}
