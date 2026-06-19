"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyChapter = exports.getChapter = exports.getChapters = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// Get chapters list
const getChapters = async (req, res) => {
    try {
        const { slug } = req.params;
        const manga = await prisma_1.default.manga.findUnique({ where: { slug } });
        if (!manga)
            return res.status(404).json({ error: 'Manga topilmadi' });
        const chapters = await prisma_1.default.chapter.findMany({
            where: { mangaId: manga.id },
            orderBy: { number: 'asc' },
            take: 500,
            select: {
                id: true,
                number: true,
                volume: true,
                title: true,
                coinPrice: true,
                createdAt: true,
                _count: { select: { pages: true } }
            }
        });
        res.json(chapters);
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.getChapters = getChapters;
// Get single chapter with pages
const getChapter = async (req, res) => {
    try {
        const { slug, number } = req.params;
        const manga = await prisma_1.default.manga.findUnique({ where: { slug } });
        if (!manga)
            return res.status(404).json({ error: 'Manga topilmadi' });
        const chapter = await prisma_1.default.chapter.findUnique({
            where: { mangaId_number: { mangaId: manga.id, number: parseInt(number) } },
            include: { pages: { orderBy: { pageNumber: 'asc' } } }
        });
        if (!chapter)
            return res.status(404).json({ error: 'Bob topilmadi' });
        // Check if paid chapter
        if (chapter.coinPrice > 0 && req.user) {
            const hasAccess = await prisma_1.default.readHistory.findUnique({
                where: { userId_mangaId: { userId: req.user.id, mangaId: manga.id } }
            });
            if (!hasAccess) {
                return res.json({
                    id: chapter.id,
                    number: chapter.number,
                    coinPrice: chapter.coinPrice,
                    locked: true,
                    previewPages: chapter.pages.slice(0, 2)
                });
            }
        }
        // Update read history
        if (req.user) {
            await prisma_1.default.readHistory.upsert({
                where: { userId_mangaId: { userId: req.user.id, mangaId: manga.id } },
                update: { chapterId: chapter.id, page: 1 },
                create: { userId: req.user.id, mangaId: manga.id, chapterId: chapter.id }
            });
        }
        // Get prev/next chapters
        const [prev, next] = await Promise.all([
            prisma_1.default.chapter.findFirst({
                where: { mangaId: manga.id, number: { lt: chapter.number } },
                orderBy: { number: 'desc' },
                select: { number: true }
            }),
            prisma_1.default.chapter.findFirst({
                where: { mangaId: manga.id, number: { gt: chapter.number } },
                orderBy: { number: 'asc' },
                select: { number: true }
            })
        ]);
        res.json({ ...chapter, prevChapter: prev?.number, nextChapter: next?.number });
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.getChapter = getChapter;
// Buy chapter with coins
const buyChapter = async (req, res) => {
    try {
        const { chapterId } = req.body;
        const userId = req.user.id;
        const chapter = await prisma_1.default.chapter.findUnique({
            where: { id: chapterId },
            include: { manga: true }
        });
        if (!chapter)
            return res.status(404).json({ error: 'Bob topilmadi' });
        if (chapter.coinPrice === 0)
            return res.status(400).json({ error: 'Bu bob tekin' });
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user || user.coins < chapter.coinPrice) {
            return res.status(400).json({ error: 'Tangalar yetarli emas' });
        }
        // Deduct coins and grant access
        await prisma_1.default.$transaction([
            prisma_1.default.user.update({
                where: { id: userId },
                data: { coins: { decrement: chapter.coinPrice } }
            }),
            prisma_1.default.coinTransaction.create({
                data: {
                    userId,
                    amount: -chapter.coinPrice,
                    type: 'SPEND',
                    status: 'APPROVED'
                }
            }),
            prisma_1.default.readHistory.upsert({
                where: { userId_mangaId: { userId, mangaId: chapter.mangaId } },
                update: { chapterId: chapter.id },
                create: { userId, mangaId: chapter.mangaId, chapterId: chapter.id }
            })
        ]);
        res.json({ success: true, message: 'Bob sotib olindi' });
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.buyChapter = buyChapter;
//# sourceMappingURL=chapter.controller.js.map