"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/manga/:slug/comments', comment_controller_1.getComments);
router.post('/manga/:slug/comments', auth_middleware_1.authenticate, comment_controller_1.createComment);
router.delete('/:id', auth_middleware_1.authenticate, comment_controller_1.deleteComment);
router.post('/:id/like', auth_middleware_1.authenticate, comment_controller_1.likeComment);
exports.default = router;
//# sourceMappingURL=comment.routes.js.map