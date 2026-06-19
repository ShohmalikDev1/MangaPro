"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const manga_controller_1 = require("../controllers/manga.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', manga_controller_1.getMangas);
router.get('/featured', manga_controller_1.getFeatured);
router.get('/trending', manga_controller_1.getTrending);
router.get('/top-translators', manga_controller_1.getTopTranslators);
router.get('/:slug', manga_controller_1.getManga);
router.get('/:slug/similar', manga_controller_1.getSimilar);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('TRANSLATOR', 'ADMIN'), manga_controller_1.createManga);
router.post('/:slug/like', auth_middleware_1.authenticate, manga_controller_1.toggleLike);
exports.default = router;
//# sourceMappingURL=manga.routes.js.map