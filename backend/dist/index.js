"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = require("express-rate-limit");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const manga_routes_1 = __importDefault(require("./routes/manga.routes"));
const chapter_routes_1 = __importDefault(require("./routes/chapter.routes"));
const coin_routes_1 = __importDefault(require("./routes/coin.routes"));
const comment_routes_1 = __importDefault(require("./routes/comment.routes"));
const rating_routes_1 = __importDefault(require("./routes/rating.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Juda ko\'p so\'rovlar. 15 daqiqadan keyin urinib ko\'ring.' }
});
app.use('/api', limiter);
// Static files
app.use('/uploads', express_1.default.static('uploads'));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/mangas', manga_routes_1.default);
app.use('/api/chapters', chapter_routes_1.default);
app.use('/api/coins', coin_routes_1.default);
app.use('/api/comments', comment_routes_1.default);
app.use('/api/ratings', rating_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'MangaPro API ishlayapti' });
});
// 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Yo\'l topilmadi' });
});
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Server xatosi'
    });
});
app.listen(PORT, () => {
    console.log(`✅ MangaPro server ${PORT} portda ishlamoqda`);
});
exports.default = app;
//# sourceMappingURL=index.js.map