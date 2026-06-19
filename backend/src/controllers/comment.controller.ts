import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getComments = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params
    const { page = '1', sort = 'newest' } = req.query

    const manga = await prisma.manga.findUnique({ where: { slug } })
    if (!manga) return res.status(404).json({ error: 'Manga topilmadi' })

    const skip = (parseInt(page as string) - 1) * 20

    const comments = await prisma.comment.findMany({
      where: { mangaId: manga.id, parentId: null },
      orderBy: sort === 'top' ? { likes: 'desc' } : { createdAt: 'desc' },
      skip,
      take: 20,
      include: {
        user: { select: { id: true, username: true, avatar: true, role: true } },
        replies: {
          include: { user: { select: { id: true, username: true, avatar: true, role: true } } },
          orderBy: { createdAt: 'asc' },
          take: 5
        }
      }
    })

    const total = await prisma.comment.count({
      where: { mangaId: manga.id, parentId: null }
    })

    res.json({ data: comments, total, pages: Math.ceil(total / 20) })
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params
    const schema = z.object({
      content: z.string().min(1).max(1000),
      parentId: z.string().optional()
    })

    const { content, parentId } = schema.parse(req.body)
    const manga = await prisma.manga.findUnique({ where: { slug } })
    if (!manga) return res.status(404).json({ error: 'Manga topilmadi' })

    const comment = await prisma.comment.create({
      data: {
        userId: req.user!.id,
        mangaId: manga.id,
        content,
        parentId
      },
      include: {
        user: { select: { id: true, username: true, avatar: true, role: true } }
      }
    })

    // Notify parent comment owner if reply
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { userId: true }
      })
      if (parent && parent.userId !== req.user!.id) {
        await prisma.notification.create({
          data: {
            userId: parent.userId,
            type: 'COMMENT_REPLY',
            title: 'Izohingizga javob',
            body: `${req.user!.id} izohingizga javob berdi`,
            link: `/manga/${slug}`
          }
        })
      }
    }

    res.status(201).json(comment)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    res.status(500).json({ error: 'Server xatosi' })
  }
}

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) return res.status(404).json({ error: 'Izoh topilmadi' })

    if (comment.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Ruxsat yo\'q' })
    }

    await prisma.comment.delete({ where: { id } })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

export const likeComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    await prisma.comment.update({
      where: { id },
      data: { likes: { increment: 1 } }
    })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}
