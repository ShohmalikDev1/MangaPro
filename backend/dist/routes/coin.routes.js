"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coin_controller_1 = require("../controllers/coin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/request', auth_middleware_1.authenticate, coin_controller_1.requestPurchase);
router.get('/transactions', auth_middleware_1.authenticate, coin_controller_1.getTransactions);
router.get('/pending', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), coin_controller_1.getPendingTransactions);
router.put('/approve/:txnId', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), coin_controller_1.approvePurchase);
router.put('/reject/:txnId', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), coin_controller_1.rejectPurchase);
exports.default = router;
//# sourceMappingURL=coin.routes.js.map