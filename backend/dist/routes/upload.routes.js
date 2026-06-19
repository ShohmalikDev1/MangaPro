"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/manga';
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).substring(7) + path_1.default.extname(file.originalname))
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Faqat rasm fayllari'));
        }
    }
});
// Upload chapter images
router.post('/chapter', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('TRANSLATOR', 'ADMIN'), upload.array('images', 100), async (req, res) => {
    try {
        const { mangaSlug, chapterNumber, volume = '1', title, coinPrice = '0' } = req.body;
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'Rasmlar yuklanmadi' });
        }
        const manga = await prisma_1.default.manga.findUnique({ where: { slug: mangaSlug } });
        if (!manga)
            return res.status(404).json({ error: 'Manga topilmadi' });
        // Check chapter limit
        const chapterCount = await prisma_1.default.chapter.count({ where: { mangaId: manga.id } });
        if (chapterCount >= 500) {
            return res.status(400).json({ error: 'Maksimal bob soni (500) ga yetildi' });
        }
        // Create pages
        const pages = [];
        for (let i = 0; i < files.length; i++) {
            pages.push({ pageNumber: i + 1, imageUrl: `/uploads/manga/${files[i].filename}` });
        }
        const chapter = await prisma_1.default.chapter.create({
            data: {
                mangaId: manga.id,
                number: parseInt(chapterNumber),
                volume: parseInt(volume),
                title: title || null,
                coinPrice: parseInt(coinPrice),
                pages: { create: pages }
            },
            include: { pages: true }
        });
        // Notify subscribers
        const bookmarks = await prisma_1.default.bookmark.findMany({ where: { mangaId: manga.id } });
        await Promise.all(bookmarks.map(b => prisma_1.default.notification.create({
            data: {
                userId: b.userId,
                type: 'NEW_CHAPTER',
                title: `${manga.title} — yangi bob!`,
                body: `Bob ${chapterNumber} chiqdi`,
                link: `/manga/${mangaSlug}/${chapterNumber}`
            }
        })));
        res.status(201).json(chapter);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Server xatosi' });
    }
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map