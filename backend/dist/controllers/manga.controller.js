"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopTranslators = exports.toggleLike = exports.getSimilar = exports.createManga = exports.getManga = exports.getTrending = exports.getFeatured = exports.getMangas = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../utils/prisma"));
// Get all mangas with filters
const getMangas = async (req, res) => {
    try {
        const { page = '1', limit = '20', genre, type, status, search, sort = 'newest' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        const where = {};
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        if (search)
            where.title = { contains: search, mode: 'insensitive' };
        if (genre)
            where.genres = { some: { genre: { name: genre } } };
        const orderBy = {
            newest: { createdAt: 'desc' },
            oldest: { createdAt: 'asc' },
            mostViewed: { viewCount: 'desc' },
            mostLiked: { likeCount: 'desc' },
        }[sort] || { createdAt: 'desc' };
        const [mangas, total] = await Promise.all([
            prisma_1.default.manga.findMany({
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
            prisma_1.default.manga.count({ where })
        ]);
        res.json({
            data: mangas,
            pagination: {
                page: parseInt(page),
                limit: take,
                total,
                pages: Math.ceil(total / take)
            }
        });
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.getMangas = getMangas;
// Get featured mangas (for hero slider)
const getFeatured = async (req, res) => {
    try {
        const mangas = await prisma_1.default.manga.findMany({
            take: 8,
            orderBy: { likeCount: 'desc' },
            include: {
                genres: { include: { genre: true } },
                translator: { select: { id: true, username: true, avatar: true } },
                _count: { select: { chapters: true } }
            }
        });
        res.json(mangas);
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.getFeatured = getFeatured;
// Get trending mangas
const getTrending = async (req, res) => {
    try {
        const { period = 'day' } = req.query;
        const dateMap = {
            day: new Date(Date.now() - 24 * 60 * 60 * 1000),
            week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        };
        const since = dateMap[period] || dateMap.day;
        const mangas = await prisma_1.default.manga.findMany({
            take: 10,
            where: { updatedAt: { gte: since } },
            orderBy: { viewCount: 'desc' },
            include: {
                _count: { select: { chapters: true } },
                translator: { select: { id: true, username: true, avatar: true } }
            }
        });
        res.json(mangas);
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.getTrending = getTrending;
// Get single manga
const getManga = async (req, res) => {
    try {
        const { slug } = req.params;
        const manga = await prisma_1.default.manga.findUnique({
            where: { slug },
            include: {
                genres: { include: { genre: true } },
                tags: { include: { tag: true } },
                translator: { select: { id: true, username: true, avatar: true, role: true } },
                _count: { select: { chapters: true, comments: true } }
            }
        });
        if (!manga)
            return res.status(404).json({ error: 'Manga topilmadi' });
        // Increase view count
        await prisma_1.default.manga.update({
            where: { slug },
            data: { viewCount: { increment: 1 } }
        });
        res.json(manga);
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.getManga = getManga;
// Create manga
const createManga = async (req, res) => {
    try {
        const schema = zod_1.z.object({
            title: zod_1.z.string().min(1).max(200),
            description: zod_1.z.string().min(10),
            cover: zod_1.z.string().url(),
            type: zod_1.z.enum(['MANGA', 'MANHWA', 'MANHUA']),
            status: zod_1.z.enum(['ONGOING', 'COMPLETED', 'DROPPED']),
            translateStatus: zod_1.z.enum(['ONGOING', 'COMPLETED', 'DROPPED']),
            ageRating: zod_1.z.string(),
            releaseYear: zod_1.z.number().int().min(1900).max(new Date().getFullYear()),
            genres: zod_1.z.array(zod_1.z.string()),
            tags: zod_1.z.array(zod_1.z.string())
        });
        const data = schema.parse(req.body);
        const slug = data.title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            + '-' + Date.now();
        const manga = await prisma_1.default.manga.create({
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
                translatorId: req.user.id,
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
        });
        res.status(201).json(manga);
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.createManga = createManga;
// Get similar mangas
const getSimilar = async (req, res) => {
    try {
        const { slug } = req.params;
        const manga = await prisma_1.default.manga.findUnique({
            where: { slug },
            include: { genres: true }
        });
        if (!manga)
            return res.status(404).json({ error: 'Manga topilmadi' });
        const genreIds = manga.genres.map(g => g.genreId);
        const similar = await prisma_1.default.manga.findMany({
            where: {
                id: { not: manga.id },
                genres: { some: { genreId: { in: genreIds } } }
            },
            take: 10,
            orderBy: { likeCount: 'desc' },
            include: { _count: { select: { chapters: true } } }
        });
        res.json(similar);
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.getSimilar = getSimilar;
// Toggle like
const toggleLike = async (req, res) => {
    try {
        const { slug } = req.params;
        const manga = await prisma_1.default.manga.findUnique({ where: { slug } });
        if (!manga)
            return res.status(404).json({ error: 'Manga topilmadi' });
        const bookmark = await prisma_1.default.bookmark.findUnique({
            where: { userId_mangaId: { userId: req.user.id, mangaId: manga.id } }
        });
        if (bookmark && bookmark.status === 'LIKED') {
            await prisma_1.default.bookmark.update({
                where: { userId_mangaId: { userId: req.user.id, mangaId: manga.id } },
                data: { status: 'READING' }
            });
            await prisma_1.default.manga.update({ where: { id: manga.id }, data: { likeCount: { decrement: 1 } } });
            return res.json({ liked: false });
        }
        await prisma_1.default.bookmark.upsert({
            where: { userId_mangaId: { userId: req.user.id, mangaId: manga.id } },
            update: { status: 'LIKED' },
            create: { userId: req.user.id, mangaId: manga.id, status: 'LIKED' }
        });
        await prisma_1.default.manga.update({ where: { id: manga.id }, data: { likeCount: { increment: 1 } } });
        res.json({ liked: true });
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.toggleLike = toggleLike;
// Get top translators
const getTopTranslators = async (req, res) => {
    try {
        const translators = await prisma_1.default.user.findMany({
            where: { role: 'TRANSLATOR' },
            take: 4,
            include: {
                translations: {
                    select: { id: true, likeCount: true },
                    take: 10
                },
                _count: { select: { translations: true } }
            }
        });
        const result = translators.map(t => ({
            id: t.id,
            username: t.username,
            avatar: t.avatar,
            mangaCount: t._count.translations,
            totalLikes: t.translations.reduce((sum, m) => sum + m.likeCount, 0)
        })).sort((a, b) => b.totalLikes - a.totalLikes);
        res.json(result);
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.getTopTranslators = getTopTranslators;
//# sourceMappingURL=manga.controller.js.map