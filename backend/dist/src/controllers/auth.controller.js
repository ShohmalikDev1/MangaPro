"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = __importDefault(require("../prisma/client"));
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const google_auth_library_1 = require("google-auth-library");
const jwt_1 = require("../utils/jwt");
const tokenBlacklist_1 = require("../utils/tokenBlacklist");
const router = express_1.default.Router();
const registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().optional(),
    username: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6),
});
router.post('/register', async (req, res) => {
    try {
        const parsed = registerSchema.parse(req.body);
        const existing = await client_1.default.user.findFirst({ where: { OR: [{ email: parsed.email }, { username: parsed.username }] } });
        if (existing)
            return res.status(400).json({ message: 'Username yoki email allaqachon mavjud' });
        const hashed = await bcryptjs_1.default.hash(parsed.password, 10);
        const user = await client_1.default.user.create({ data: { username: parsed.username, email: parsed.email, password: hashed } });
        const accessToken = (0, jwt_1.signAccessToken)({ userId: user.id });
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user.id });
        const safeUser = { ...user, password: undefined };
        return res.json({ user: safeUser, accessToken, refreshToken });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError)
            return res.status(400).json({ message: err.errors });
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const parsed = loginSchema.parse(req.body);
        const where = parsed.email ? { email: parsed.email } : { username: parsed.username };
        const user = await client_1.default.user.findUnique({ where: where });
        if (!user || !user.password)
            return res.status(400).json({ message: 'Noto‘g‘ri kredentiallar' });
        const match = await bcryptjs_1.default.compare(parsed.password, user.password);
        if (!match)
            return res.status(400).json({ message: 'Noto‘g‘ri kredentiallar' });
        const accessToken = (0, jwt_1.signAccessToken)({ userId: user.id });
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user.id });
        const safeUser = { ...user, password: undefined };
        return res.json({ user: safeUser, accessToken, refreshToken });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError)
            return res.status(400).json({ message: err.errors });
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
router.post('/google', async (req, res) => {
    try {
        const { googleToken } = req.body;
        if (!googleToken)
            return res.status(400).json({ message: 'googleToken kerak' });
        const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({ idToken: googleToken, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        if (!payload || !payload.email)
            return res.status(400).json({ message: 'Google token yaroqsiz' });
        let user = await client_1.default.user.findUnique({ where: { email: payload.email } });
        if (!user) {
            user = await client_1.default.user.create({ data: { email: payload.email, username: payload.name || payload.email.split('@')[0], googleId: payload.sub, avatar: payload.picture || null } });
        }
        const accessToken = (0, jwt_1.signAccessToken)({ userId: user.id });
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user.id });
        const safeUser = { ...user, password: undefined };
        return res.json({ user: safeUser, accessToken, refreshToken });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Google auth failed' });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ message: 'refreshToken kerak' });
        if ((0, tokenBlacklist_1.isBlacklisted)(refreshToken))
            return res.status(401).json({ message: 'Invalid refresh token' });
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const user = await client_1.default.user.findUnique({ where: { id: payload.userId } });
        if (!user)
            return res.status(404).json({ message: 'User topilmadi' });
        const accessToken = (0, jwt_1.signAccessToken)({ userId: user.id });
        return res.json({ accessToken });
    }
    catch (err) {
        console.error(err);
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
});
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ message: 'refreshToken kerak' });
        (0, tokenBlacklist_1.addToBlacklist)(refreshToken);
        return res.json({ message: 'Chiqish amalga oshirildi' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
