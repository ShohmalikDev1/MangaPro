import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getRatings = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params
    const manga = await prisma.manga.findUnique({ where: { slug } })
    if (!manga) return res.status(404).json({ error: 'Manga topilmadi' })

    const ratings = await prisma.rating.findMany({
      where: { mangaId: manga.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, avatar: true } }
      }
    })

    const avg = ratings.length > 0
      ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
      : 0

    res.json({ ratings, average: avg.toFixed(1), total: ratings.length })
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

export const createRating = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params
    const schema = z.object({
      translatorId: z.string(),
      stars: z.number().int().min(1).max(5),
      review: z.string().max(1000).optional()
    })

    const { translatorId, stars, review } = schema.parse(req.body)
    const manga = await prisma.manga.findUnique({ where: { slug } })
    if (!manga) return res.status(404).json({ error: 'Manga topilmadi' })

    const rating = await prisma.rating.upsert({
      where: { userId_mangaId: { userId: req.user!.id, mangaId: manga.id } },
      update: { stars, review, translatorId },
      create: {
        userId: req.user!.id,
        mangaId: manga.id,
        translatorId,
        stars,
        review
      },
      include: { user: { select: { id: true, username: true, avatar: true } } }
    })

    // Notify admin
    await prisma.notification.create({
      data: {
        userId: translatorId,
        type: 'RATING',
        title: 'Yangi baho!',
        body: `"${manga.title}" ga ${stars} yulduz baho berildi`,
        link: `/manga/${slug}`
      }
    })

    res.json(rating)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    res.status(500).json({ error: 'Server xatosi' })
  }
}
