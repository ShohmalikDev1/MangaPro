"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeComment = exports.deleteComment = exports.createComment = exports.getComments = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../utils/prisma"));
const getComments = async (req, res) => {
    try {
        const { slug } = req.params;
        const { page = '1', sort = 'newest' } = req.query;
        const manga = await prisma_1.default.manga.findUnique({ where: { slug } });
        if (!manga)
            return res.status(404).json({ error: 'Manga topilmadi' });
        const skip = (parseInt(page) - 1) * 20;
        const comments = await prisma_1.default.comment.findMany({
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
        });
        const total = await prisma_1.default.comment.count({
            where: { mangaId: manga.id, parentId: null }
        });
        res.json({ data: comments, total, pages: Math.ceil(total / 20) });
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.getComments = getComments;
const createComment = async (req, res) => {
    try {
        const { slug } = req.params;
        const schema = zod_1.z.object({
            content: zod_1.z.string().min(1).max(1000),
            parentId: zod_1.z.string().optional()
        });
        const { content, parentId } = schema.parse(req.body);
        const manga = await prisma_1.default.manga.findUnique({ where: { slug } });
        if (!manga)
            return res.status(404).json({ error: 'Manga topilmadi' });
        const comment = await prisma_1.default.comment.create({
            data: {
                userId: req.user.id,
                mangaId: manga.id,
                content,
                parentId
            },
            include: {
                user: { select: { id: true, username: true, avatar: true, role: true } }
            }
        });
        // Notify parent comment owner if reply
        if (parentId) {
            const parent = await prisma_1.default.comment.findUnique({
                where: { id: parentId },
                select: { userId: true }
            });
            if (parent && parent.userId !== req.user.id) {
                await prisma_1.default.notification.create({
                    data: {
                        userId: parent.userId,
                        type: 'COMMENT_REPLY',
                        title: 'Izohingizga javob',
                        body: `${req.user.id} izohingizga javob berdi`,
                        link: `/manga/${slug}`
                    }
                });
            }
        }
        res.status(201).json(comment);
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.createComment = createComment;
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await prisma_1.default.comment.findUnique({ where: { id } });
        if (!comment)
            return res.status(404).json({ error: 'Izoh topilmadi' });
        if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Ruxsat yo\'q' });
        }
        await prisma_1.default.comment.delete({ where: { id } });
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.deleteComment = deleteComment;
const likeComment = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.comment.update({
            where: { id },
            data: { likes: { increment: 1 } }
        });
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.likeComment = likeComment;
//# sourceMappingURL=comment.controller.js.map