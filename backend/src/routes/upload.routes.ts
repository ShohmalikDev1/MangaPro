import { Router, Request, Response } from 'express'
import { authenticate, requireRole } from '../middleware/auth.middleware'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import prisma from '../utils/prisma'

const router = Router()
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/manga'
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).substring(7) + path.extname(file.originalname))
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Faqat rasm fayllari'))
    }
  }
})

// Upload chapter images
router.post('/chapter', authenticate, requireRole('TRANSLATOR', 'ADMIN'), upload.array('images', 100), async (req: any, res: Response) => {
  try {
    const { mangaSlug, chapterNumber, volume = '1', title, coinPrice = '0' } = req.body
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Rasmlar yuklanmadi' })
    }

    const manga = await prisma.manga.findUnique({ where: { slug: mangaSlug } })
    if (!manga) return res.status(404).json({ error: 'Manga topilmadi' })

    // Check chapter limit
    const chapterCount = await prisma.chapter.count({ where: { mangaId: manga.id } })
    if (chapterCount >= 500) {
      return res.status(400).json({ error: 'Maksimal bob soni (500) ga yetildi' })
    }

    // Create pages
    const pages = []
    for (let i = 0; i < files.length; i++) {
      pages.push({ pageNumber: i + 1, imageUrl: `/uploads/manga/${files[i].filename}` })
    }

    const chapter = await prisma.chapter.create({
      data: {
        mangaId: manga.id,
        number: parseInt(chapterNumber),
        volume: parseInt(volume),
        title: title || null,
        coinPrice: parseInt(coinPrice),
        pages: { create: pages }
      },
      include: { pages: true }
    })

    // Notify subscribers
    const bookmarks = await prisma.bookmark.findMany({ where: { mangaId: manga.id } })
    await Promise.all(bookmarks.map(b =>
      prisma.notification.create({
        data: {
          userId: b.userId,
          type: 'NEW_CHAPTER',
          title: `${manga.title} — yangi bob!`,
          body: `Bob ${chapterNumber} chiqdi`,
          link: `/manga/${mangaSlug}/${chapterNumber}`
        }
      })
    ))

    res.status(201).json(chapter)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server xatosi' })
  }
})

export default router
