"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.refreshToken = exports.googleAuth = exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const zod_1 = require("zod");
const crypto_1 = __importDefault(require("crypto"));
const tls_1 = __importDefault(require("tls"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const resetCodes = new Map();
const generateTokens = (user) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
const sendSmtpCommand = (socket, command) => {
    return new Promise((resolve, reject) => {
        let data = '';
        const onData = (chunk) => {
            data += chunk.toString('utf8');
            const lines = data.trimEnd().split(/\r?\n/);
            const last = lines[lines.length - 1];
            if (/^\d{3} /.test(last)) {
                socket.off('data', onData);
                resolve(data);
            }
        };
        socket.on('data', onData);
        socket.once('error', reject);
        if (command)
            socket.write(`${command}\r\n`);
    });
};
const escapeSmtpData = (value) => value.replace(/^\./gm, '..');
const sendResetEmail = async (to, code) => {
    const user = process.env.GMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
    if (!user || !pass) {
        console.log(`[password-reset] ${to} uchun kod: ${code}`);
        return;
    }
    const subject = 'MangaPro parolni tiklash kodi';
    const body = [
        'Assalomu alaykum!',
        '',
        `MangaPro parolingizni tiklash kodi: ${code}`,
        'Kod 15 daqiqa amal qiladi.',
        '',
        'Agar bu so‘rovni siz yubormagan bo‘lsangiz, xabarni e’tiborsiz qoldiring.',
    ].join('\n');
    const message = [
        `From: MangaPro <${user}>`,
        `To: ${to}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        '',
        body,
    ].join('\r\n');
    const socket = tls_1.default.connect(465, 'smtp.gmail.com', { servername: 'smtp.gmail.com' });
    try {
        await sendSmtpCommand(socket);
        await sendSmtpCommand(socket, 'EHLO mangapro.local');
        await sendSmtpCommand(socket, 'AUTH LOGIN');
        await sendSmtpCommand(socket, Buffer.from(user).toString('base64'));
        await sendSmtpCommand(socket, Buffer.from(pass).toString('base64'));
        await sendSmtpCommand(socket, `MAIL FROM:<${user}>`);
        await sendSmtpCommand(socket, `RCPT TO:<${to}>`);
        await sendSmtpCommand(socket, 'DATA');
        await sendSmtpCommand(socket, `${escapeSmtpData(message)}\r\n.`);
        await sendSmtpCommand(socket, 'QUIT');
    }
    finally {
        socket.end();
    }
};
// Register
const register = async (req, res) => {
    try {
        const schema = zod_1.z.object({
            username: zod_1.z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
            email: zod_1.z.string().email(),
            password: zod_1.z.string().min(6)
        });
        const { username, email, password } = schema.parse(req.body);
        const existing = await prisma_1.default.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });
        if (existing) {
            return res.status(400).json({
                error: existing.email === email
                    ? 'Bu email allaqachon ro\'yxatdan o\'tgan'
                    : 'Bu username band'
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.default.user.create({
            data: { username, email, password: hashedPassword }
        });
        const tokens = generateTokens(user);
        res.status(201).json({
            user: { id: user.id, username: user.username, email: user.email, role: user.role, coins: user.coins },
            ...tokens
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.register = register;
// Login
const login = async (req, res) => {
    try {
        const schema = zod_1.z.object({
            login: zod_1.z.string(),
            password: zod_1.z.string()
        });
        const { login: loginInput, password } = schema.parse(req.body);
        const user = await prisma_1.default.user.findFirst({
            where: {
                OR: [{ email: loginInput }, { username: loginInput }]
            }
        });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });
        }
        const tokens = generateTokens(user);
        res.json({
            user: { id: user.id, username: user.username, email: user.email, role: user.role, coins: user.coins, avatar: user.avatar },
            ...tokens
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Ma\'lumotlar noto\'g\'ri' });
        }
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const schema = zod_1.z.object({ email: zod_1.z.string().email() });
        const { email } = schema.parse(req.body);
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (user) {
            const code = crypto_1.default.randomInt(100000, 999999).toString();
            const codeHash = await bcryptjs_1.default.hash(code, 10);
            resetCodes.set(email, { codeHash, expiresAt: Date.now() + 15 * 60 * 1000 });
            await sendResetEmail(email, code);
        }
        res.json({ message: 'Agar email topilsa, parolni tiklash kodi yuborildi' });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Email noto‘g‘ri' });
        }
        res.status(500).json({ error: 'Email yuborishda xatolik' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const schema = zod_1.z.object({
            email: zod_1.z.string().email(),
            code: zod_1.z.string().length(6),
            password: zod_1.z.string().min(6)
        });
        const { email, code, password } = schema.parse(req.body);
        const reset = resetCodes.get(email);
        if (!reset || reset.expiresAt < Date.now()) {
            resetCodes.delete(email);
            return res.status(400).json({ error: 'Kod eskirgan yoki topilmadi' });
        }
        const validCode = await bcryptjs_1.default.compare(code, reset.codeHash);
        if (!validCode) {
            return res.status(400).json({ error: 'Kod noto‘g‘ri' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        await prisma_1.default.user.update({ where: { email }, data: { password: hashedPassword } });
        resetCodes.delete(email);
        res.json({ message: 'Parol yangilandi' });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Ma‘lumotlar noto‘g‘ri' });
        }
        res.status(500).json({ error: 'Parolni yangilashda xatolik' });
    }
};
exports.resetPassword = resetPassword;
// Google OAuth
const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token)
            return res.status(400).json({ error: 'Token taqdim etilmagan' });
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload)
            return res.status(400).json({ error: 'Token yaroqsiz' });
        const { sub: googleId, email, name, picture } = payload;
        if (!email)
            return res.status(400).json({ error: 'Email topilmadi' });
        let user = await prisma_1.default.user.findFirst({
            where: { OR: [{ googleId }, { email }] }
        });
        if (!user) {
            const username = (name || email.split('@')[0])
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '_')
                .slice(0, 25) + '_' + Math.floor(Math.random() * 1000);
            user = await prisma_1.default.user.create({
                data: { googleId, email, username, avatar: picture }
            });
        }
        else if (!user.googleId) {
            user = await prisma_1.default.user.update({
                where: { id: user.id },
                data: { googleId, avatar: picture }
            });
        }
        const tokens = generateTokens(user);
        res.json({
            user: { id: user.id, username: user.username, email: user.email, role: user.role, coins: user.coins, avatar: user.avatar },
            ...tokens
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Google autentifikatsiya xatosi' });
    }
};
exports.googleAuth = googleAuth;
// Refresh token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token)
            return res.status(401).json({ error: 'Refresh token taqdim etilmagan' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await prisma_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user)
            return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
        const tokens = generateTokens(user);
        res.json(tokens);
    }
    catch {
        res.status(401).json({ error: 'Refresh token yaroqsiz' });
    }
};
exports.refreshToken = refreshToken;
// Get me
const getMe = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, username: true, email: true, role: true, coins: true, avatar: true, createdAt: true }
        });
        res.json(user);
    }
    catch {
        res.status(500).json({ error: 'Server xatosi' });
    }
};
exports.getMe = getMe;
//# sourceMappingURL=auth.controller.js.map