"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRating = exports.getRatings = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../utils/prisma"));
const getRatings = async (req, res) => {
    try {
        const { slug } = req.params;
        const manga = await prisma_1.default.manga.findUnique({ where: { slug } });
        if (!manga)
            return res.status(404).json({ error: 'Manga topilmadi' });
        const ratings = await prisma_1.default.rating.findMany({
            where: { mangaId: manga.id },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, username: true, avatar: true } }
            }
        });
        const avg = ratings.length > 0
            ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
            : 0;
        res.json({ ratings, average: avg.toFixed(1), total: ratings.length });
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.getRatings = getRatings;
const createRating = async (req, res) => {
    try {
        const { slug } = req.params;
        const schema = zod_1.z.object({
            translatorId: zod_1.z.string(),
            stars: zod_1.z.number().int().min(1).max(5),
            review: zod_1.z.string().max(1000).optional()
        });
        const { translatorId, stars, review } = schema.parse(req.body);
        const manga = await prisma_1.default.manga.findUnique({ where: { slug } });
        if (!manga)
            return res.status(404).json({ error: 'Manga topilmadi' });
        const rating = await prisma_1.default.rating.upsert({
            where: { userId_mangaId: { userId: req.user.id, mangaId: manga.id } },
            update: { stars, review, translatorId },
            create: {
                userId: req.user.id,
                mangaId: manga.id,
                translatorId,
                stars,
                review
            },
            include: { user: { select: { id: true, username: true, avatar: true } } }
        });
        // Notify admin
        await prisma_1.default.notification.create({
            data: {
                userId: translatorId,
                type: 'RATING',
                title: 'Yangi baho!',
                body: `"${manga.title}" ga ${stars} yulduz baho berildi`,
                link: `/manga/${slug}`
            }
        });
        res.json(rating);
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.createRating = createRating;
//# sourceMappingURL=rating.controller.js.map