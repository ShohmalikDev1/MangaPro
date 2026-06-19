import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../utils/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

// Get all mangas with filters
export const getMangas = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', genre, type, status, search, sort = 'newest' } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const take = parseInt(limit as string)

    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status
    if (search) where.title = { contains: search as string, mode: 'insensitive' }
    if (genre) where.genres = { some: { genre: { name: genre as string } } }

    const orderBy: any = {
      newest: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
      mostViewed: { viewCount: 'desc' },
      mostLiked: { likeCount: 'desc' },
    }[sort as string] || { createdAt: 'desc' }

    const [mangas, total] = await Promise.all([
      prisma.manga.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          genres: { include: { genre: true } },
          tags: { include: { tag: true } },
          translator: { select: { id: true, username: true, avatar: true } },
          _count: { select: { chapters: true } }
        }
      }),
      prisma.manga.count({ where })
    ])

    res.json({
      data: mangas,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    })
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

// Get featured mangas (for hero slider)
export const getFeatured = async (req: Request, res: Response) => {
  try {
    const mangas = await prisma.manga.findMany({
      take: 8,
      orderBy: { likeCount: 'desc' },
      include: {
        genres: { include: { genre: true } },
        translator: { select: { id: true, username: true, avatar: true } },
        _count: { select: { chapters: true } }
      }
    })
    res.json(mangas)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

// Get trending mangas
export const getTrending = async (req: Request, res: Response) => {
  try {
    const { period = 'day' } = req.query
    const dateMap: any = {
      day: new Date(Date.now() - 24 * 60 * 60 * 1000),
      week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
    const since = dateMap[period as string] || dateMap.day

    const mangas = await prisma.manga.findMany({
      take: 10,
      where: { updatedAt: { gte: since } },
      orderBy: { viewCount: 'desc' },
      include: {
        _count: { select: { chapters: true } },
        translator: { select: { id: true, username: true, avatar: true } }
      }
    })
    res.json(mangas)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

// Get single manga
export const getManga = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params

    const manga = await prisma.manga.findUnique({
      where: { slug },
      include: {
        genres: { include: { genre: true } },
        tags: { include: { tag: true } },
        translator: { select: { id: true, username: true, avatar: true, role: true } },
        _count: { select: { chapters: true, comments: true } }
      }
    })

    if (!manga) return res.status(404).json({ error: 'Manga topilmadi' })

    // Increase view count
    await prisma.manga.update({
      where: { slug },
      data: { viewCount: { increment: 1 } }
    })

    res.json(manga)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

// Create manga
export const createManga = async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1).max(200),
      description: z.string().min(10),
      cover: z.string().url(),
      type: z.enum(['MANGA', 'MANHWA', 'MANHUA']),
      status: z.enum(['ONGOING', 'COMPLETED', 'DROPPED']),
      translateStatus: z.enum(['ONGOING', 'COMPLETED', 'DROPPED']),
      ageRating: z.string(),
      releaseYear: z.number().int().min(1900).max(new Date().getFullYear()),
      genres: z.array(z.string()),
      tags: z.array(z.string())
    })

    const data = schema.parse(req.body)
    const slug = data.title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      + '-' + Date.now()

    const manga = await prisma.manga.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        cover: data.cover,
        type: data.type,
        status: data.status,
        translateStatus: data.translateStatus,
        ageRating: data.ageRating,
        releaseYear: data.releaseYear,
        translatorId: req.user!.id,
        genres: {
          create: data.genres.map(genreId => ({ genreId }))
        },
        tags: {
          create: data.tags.map(tagId => ({ tagId }))
        }
      },
      include: {
        genres: { include: { genre: true } },
        tags: { include: { tag: true } }
      }
    })

    res.status(201).json(manga)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    res.status(500).json({ error: 'Server xatosi' })
  }
}

// Get similar mangas
export const getSimilar = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params
    const manga = await prisma.manga.findUnique({
      where: { slug },
      include: { genres: true }
    })
    if (!manga) return res.status(404).json({ error: 'Manga topilmadi' })

    const genreIds = manga.genres.map(g => g.genreId)
    const similar = await prisma.manga.findMany({
      where: {
        id: { not: manga.id },
        genres: { some: { genreId: { in: genreIds } } }
      },
      take: 10,
      orderBy: { likeCount: 'desc' },
      include: { _count: { select: { chapters: true } } }
    })

    res.json(similar)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

// Toggle like
export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params
    const manga = await prisma.manga.findUnique({ where: { slug } })
    if (!manga) return res.status(404).json({ error: 'Manga topilmadi' })

    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_mangaId: { userId: req.user!.id, mangaId: manga.id } }
    })

    if (bookmark && bookmark.status === 'LIKED') {
      await prisma.bookmark.update({
        where: { userId_mangaId: { userId: req.user!.id, mangaId: manga.id } },
        data: { status: 'READING' }
      })
      await prisma.manga.update({ where: { id: manga.id }, data: { likeCount: { decrement: 1 } } })
      return res.json({ liked: false })
    }

    await prisma.bookmark.upsert({
      where: { userId_mangaId: { userId: req.user!.id, mangaId: manga.id } },
      update: { status: 'LIKED' },
      create: { userId: req.user!.id, mangaId: manga.id, status: 'LIKED' }
    })
    await prisma.manga.update({ where: { id: manga.id }, data: { likeCount: { increment: 1 } } })
    res.json({ liked: true })
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}

// Get top translators
export const getTopTranslators = async (req: Request, res: Response) => {
  try {
    const translators = await prisma.user.findMany({
      where: { role: 'TRANSLATOR' },
      take: 4,
      include: {
        translations: {
          select: { id: true, likeCount: true },
          take: 10
        },
        _count: { select: { translations: true } }
      }
    })

    const result = translators.map(t => ({
      id: t.id,
      username: t.username,
      avatar: t.avatar,
      mangaCount: t._count.translations,
      totalLikes: t.translations.reduce((sum, m) => sum + m.likeCount, 0)
    })).sort((a, b) => b.totalLikes - a.totalLikes)

    res.json(result)
  } catch {
    res.status(500).json({ error: 'Server xatosi' })
  }
}
