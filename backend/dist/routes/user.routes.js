"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/top-readers', user_controller_1.getTopReaders);
router.get('/:id', user_controller_1.getProfile);
router.get('/me/bookmarks', auth_middleware_1.authenticate, user_controller_1.getBookmarks);
router.post('/me/bookmarks', auth_middleware_1.authenticate, user_controller_1.updateBookmark);
router.get('/me/history', auth_middleware_1.authenticate, user_controller_1.getReadHistory);
router.get('/me/notifications', auth_middleware_1.authenticate, user_controller_1.getNotifications);
router.post('/me/notifications/read', auth_middleware_1.authenticate, user_controller_1.markNotificationsRead);
exports.default = router;
//# sourceMappingURL=user.routes.js.map