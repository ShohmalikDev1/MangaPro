"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rating_controller_1 = require("../controllers/rating.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/manga/:slug/ratings', rating_controller_1.getRatings);
router.post('/manga/:slug/ratings', auth_middleware_1.authenticate, rating_controller_1.createRating);
exports.default = router;
//# sourceMappingURL=rating.routes.js.map