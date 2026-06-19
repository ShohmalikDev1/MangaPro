"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = (0, express_1.Router)();
const adminOnly = [auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN')];
// Dashboard stats
router.get('/stats', ...adminOnly, async (req, res) => {
    try {
        const [users, mangas, chapters, pendingTxns] = await Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.manga.count(),
            prisma_1.default.chapter.count(),
            prisma_1.default.coinTransaction.count({ where: { status: 'PENDING' } })
        ]);
        res.json({ users, mangas, chapters, pendingTxns });
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
});
// Get all users
router.get('/users', ...adminOnly, async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, username: true, email: true, role: true, coins: true, createdAt: true }
        });
        res.json(users);
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
});
// Update user role
router.put('/users/:id/role', ...adminOnly, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await prisma_1.default.user.update({
            where: { id: req.params.id },
            data: { role }
        });
        res.json(user);
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
});
// Get all mangas
router.get('/mangas', ...adminOnly, async (req, res) => {
    try {
        const mangas = await prisma_1.default.manga.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                translator: { select: { id: true, username: true } },
                _count: { select: { chapters: true } }
            }
        });
        res.json(mangas);
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
});
// Delete manga
router.delete('/mangas/:id', ...adminOnly, async (req, res) => {
    try {
        await prisma_1.default.manga.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map