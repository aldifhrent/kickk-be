"use strict";
/** @format */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const express_1 = require("express");
const cart_controller_1 = __importDefault(require("../controllers/cart.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const cartRouter = () => {
    const router = (0, express_1.Router)();
    router.get("/", auth_middleware_1.verifyUser, cart_controller_1.default.getUserCart);
    router.delete("/:productId", auth_middleware_1.verifyUser, cart_controller_1.default.deleteCart);
    router.post("/", auth_middleware_1.verifyUser, cart_controller_1.default.addToCart);
    router.post("/midtrans", auth_middleware_1.verifyUser, cart_controller_1.default.checkout);
    router.patch("/midtrans/:no_inv", auth_middleware_1.verifyUser, cart_controller_1.default.updatePayment);
    return router;
};
exports.cartRouter = cartRouter;
