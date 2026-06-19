"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// chapter.routes.ts
const express_1 = require("express");
const chapter_controller_1 = require("../controllers/chapter.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/manga/:slug/chapters', chapter_controller_1.getChapters);
router.get('/manga/:slug/chapters/:number', auth_middleware_1.authenticate, chapter_controller_1.getChapter);
router.post('/buy', auth_middleware_1.authenticate, chapter_controller_1.buyChapter);
exports.default = router;
//# sourceMappingURL=chapter.routes.js.map