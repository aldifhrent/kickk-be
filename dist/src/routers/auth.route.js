"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const validate_1 = require("@/middlewares/validate");
const auth_middleware_1 = require("@/middlewares/auth.middleware");
class authRouter {
    constructor() {
        this.auth = new auth_controller_1.default();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/signin", this.auth.signIn);
        this.router.post("/signup", validate_1.validateSignUp, this.auth.signUp);
        this.router.post("/token", auth_middleware_1.verifyRefreshToken, this.auth.refreshToken);
    }
    getRouter() {
        return this.router;
    }
}
exports.authRouter = authRouter;
